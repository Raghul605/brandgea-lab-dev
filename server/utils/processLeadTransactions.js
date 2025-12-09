// import mongoose from 'mongoose';
// import ManufacturerFindTransaction from '../models/ManufacturerFindTransaction.js';
// import User from '../models/User.js';
// import TempLeadStore from '../models/tempLeadStoreModel.js';
// import Lock from '../models/lockModel.js'; 

// const LOCK_KEY = "processLeadTransactionsLock";
// const MAX_BATCH = 50; 

// export default async function processLeadTransactions() {
//   const session = await mongoose.startSession();

//   const lockAcquired = await tryAcquireLock();
//   if (!lockAcquired) {
//     console.log("Process already running. Exiting to avoid concurrency issues.");
//     return;
//   }

//   try {
//     // Start the session transaction
//     session.startTransaction();

//     // Fetch eligible transactions oldest first, limit batch size
//     const transactions = await ManufacturerFindTransaction.find({
//       status: 'succeeded',
//       added_to_temp_lead_doc: false,
//       data_not_found: { $ne: true },
//     })
//       .sort({ createdAt: 1 })
//       .limit(MAX_BATCH)
//       .session(session);

//     console.log(`🔍 Found ${transactions.length} eligible transactions`);

//     if (!transactions.length) {
//       console.log('No eligible ManufacturerFindTransaction documents to process.');
//       await session.commitTransaction();
//       return;
//     }

//     for (const txn of transactions) {
//       try {
//         const user = await User.findById(txn.userId).lean().session(session);

//         if (!user) {
//           console.warn(`❌ User not found for userId ${txn.userId}. Marking data_not_found.`);
//           txn.data_not_found = true;
//           await txn.save({ session });
//           continue;
//         }

//         const chatSubDoc = (user.chat || []).find(
//           (chat) => chat._id.toString() === txn.chatId.toString()
//         );

//         if (!chatSubDoc) {
//           console.warn(`❌ Chat not found for chatId ${txn.chatId} in user ${txn.userId}. Marking data_not_found.`);
//           txn.data_not_found = true;
//           await txn.save({ session });
//           continue;
//         }

//         // Extract data with fallbacks
//         const CustomerName = user.name || '';
//         const CustomerMobile = user.mobile || '';  
//         const CustomerEmail = user.email || '';
//         const leadTitle = chatSubDoc.heading;
//         const Requirement = chatSubDoc.confirmed_tech_pack;
//         const Payments_For_ManufacturerFind = chatSubDoc.Payments_For_ManufacturerFind;

//         // ✅ IMAGES OPTIONAL - Collect if available
//         const referenceimages = [];
//         if (Array.isArray(chatSubDoc.messages)) {
//           chatSubDoc.messages.forEach((msg) => {
//             if (msg.content?.imageUrls?.length > 0) {
//               referenceimages.push(...msg.content.imageUrls);
//             }
//           });
//         }

//         // Validate REQUIRED fields only (images excluded)
//         if (
//           !CustomerName ||
//           !CustomerMobile ||
//           !CustomerEmail ||
//           !leadTitle ||
//           !Requirement ||
//           !Payments_For_ManufacturerFind
//         ) {
//           console.warn(`❌ Required data missing in transaction ${txn._id}. Marking data_not_found.`);
//           txn.data_not_found = true;
//           await txn.save({ session });
//           continue;
//         }

//         // ✅ Create TempLeadStore - images optional (can be [])
//         const tempLead = new TempLeadStore({
//           CustomerName,
//           CustomerMobile,
//           CustomerEmail,
//           leadTitle,
//           Requirement,
//           referenceimages,  // ✅ Empty array OK
//           LTVM_Automated: false,
//           doc_created_by: 'system',
//         });

//         await tempLead.save({ session });

//         // Mark transaction as processed
//         txn.added_to_temp_lead_doc = true;
//         await txn.save({ session });

//         console.log(`✅ Created lead ${tempLead._id} for ${CustomerName} | Images: ${referenceimages.length} | Txn: ${txn._id}`);

//       } catch (processError) {
//         console.error(`❌ Error processing transaction ${txn._id}:`, {
//           message: processError.message,
//           userId: txn.userId,
//           chatId: txn.chatId
//         });
//         // Continue processing other transactions
//       }
//     }

//     await session.commitTransaction();
//     console.log(`✅ Batch of ${transactions.length} transactions processed successfully`);
    
//   } catch (error) {
//     console.error('💥 Transaction failed:', error);
//     await session.abortTransaction();
//   } finally {
//     session.endSession();
//     await releaseLock();
//   }
// };

// // Lock functions (unchanged)
// const tryAcquireLock = async () => {
//   try {
//     const now = new Date();
//     const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

//     await Lock.deleteOne({
//       key: LOCK_KEY,
//       lockedAt: { $lt: new Date(now.getTime() - LOCK_TIMEOUT_MS) }
//     });

//     await Lock.create({ key: LOCK_KEY, lockedAt: now });
//     console.log("🔒 Lock acquired.");
//     return true;
//   } catch (error) {
//     console.log("🔒 Lock acquisition failed, process already running.");
//     return false;
//   }
// };

// const releaseLock = async () => {
//   try {
//     await Lock.deleteOne({ key: LOCK_KEY });
//     console.log("🔓 Lock released.");
//   } catch (error) {
//     console.error("Error releasing lock:", error);
//   }
// };


import mongoose from "mongoose";
import ManufacturerFindTransaction from "../models/ManufacturerFindTransaction.js";
import User from "../models/User.js";
import TempLeadStore from "../models/tempLeadStoreModel.js";
import LeadQueue from "../models/LeadQueueModel.js";
import Lock from "../models/lockModel.js";

const LOCK_KEY = "processLeadTransactionsLock";

export default async function processLeadTransactions() {
  const session = await mongoose.startSession();

  const lockAcquired = await tryAcquireLock();
  if (!lockAcquired) {
    console.log(
      "Process already running. Exiting to avoid concurrency issues."
    );
    return;
  }

  let loopCount = 3; // ✅ Start with 3 loops

  try {
    session.startTransaction();

    while (loopCount > 0) {
      const queueDocs = await LeadQueue.find({})
        .sort({ createdAt: 1 }) // ✅ OLDEST FIRST (FIFO)
        .limit(1)
        .session(session);

      if (queueDocs.length === 0) {
        console.log(
          `🔍 No LeadQueue docs found. Loops remaining: ${loopCount}`
        );
        loopCount--;
        continue;
      }

      // ✅ Reset loops when found new doc!
      loopCount = 3;
      const queueDoc = queueDocs[0];
      const docId = queueDoc.doc_id;

      console.log(`🔍 Processing LeadQueue doc: ${docId}`);

      try {
        // ✅ Find ManufacturerFindTransaction by queue doc_id
        const txn = await ManufacturerFindTransaction.findById(docId).session(
          session
        );
        if (!txn) {
          console.warn(`❌ Transaction not found for doc_id ${docId}`);
          await queueDoc.deleteOne({ session }); // Clean up invalid queue
          continue;
        }

        const user = await User.findById(txn.userId).lean().session(session);
        if (!user) {
          console.warn(`❌ User not found for userId ${txn.userId}`);
          txn.data_not_found = true;
          await txn.save({ session });
          await queueDoc.deleteOne({ session });
          continue;
        }

        const chatSubDoc = (user.chat || []).find(
          (chat) => chat._id.toString() === txn.chatId.toString()
        );
        if (!chatSubDoc) {
          console.warn(`❌ Chat not found for chatId ${txn.chatId}`);
          txn.data_not_found = true;
          await txn.save({ session });
          await queueDoc.deleteOne({ session });
          continue;
        }

        // Extract data (same validation logic)
        const CustomerName = user.name || "";
        const CustomerMobile = user.mobile || "";
        const CustomerEmail = user.email || "";
        const leadTitle = chatSubDoc.heading;
        const Requirement = chatSubDoc.confirmed_tech_pack;
        const Payments_For_ManufacturerFind =
          chatSubDoc.Payments_For_ManufacturerFind;

        const referenceimages = [];
        if (Array.isArray(chatSubDoc.messages)) {
          chatSubDoc.messages.forEach((msg) => {
            if (msg.content?.imageUrls?.length > 0) {
              referenceimages.push(...msg.content.imageUrls);
            }
          });
        }

        if (
          !CustomerName ||
          !CustomerMobile ||
          !CustomerEmail ||
          !leadTitle ||
          !Requirement ||
          !Payments_For_ManufacturerFind
        ) {
          console.warn(`❌ Required data missing for ${docId}`);
          txn.data_not_found = true;
          await txn.save({ session });
          await queueDoc.deleteOne({ session });
          continue;
        }

        // ✅ Create TempLeadStore
        const tempLead = new TempLeadStore({
          CustomerName,
          CustomerMobile,
          CustomerEmail,
          leadTitle,
          Requirement,
          referenceimages,
          LTVM_Automated: false,
          doc_created_by: "system",
        });
        await tempLead.save({ session });

        // ✅ Mark transaction processed
        txn.added_to_temp_lead_doc = true;
        await txn.save({ session });

        // ✅ DELETE from LeadQueue after success
        await queueDoc.deleteOne({ session });

        console.log(
          `✅ Created lead ${tempLead._id} | Queue doc deleted | Loops reset to 3`
        );
      } catch (processError) {
        console.error(
          `❌ Error processing queue doc ${docId}:`,
          processError.message
        );
      }
    }

    await session.commitTransaction();
    console.log(`✅ Process completed. Final loops: ${loopCount}`);
  } catch (error) {
    console.error("💥 Transaction failed:", error);
    await session.abortTransaction();
  } finally {
    session.endSession();
    await releaseLock();
  }
}

// Lock functions unchanged
const tryAcquireLock = async () => {
  try {
    const now = new Date();
    const LOCK_TIMEOUT_MS = 5 * 60 * 1000;

    await Lock.deleteOne({
      key: LOCK_KEY,
      lockedAt: { $lt: new Date(now.getTime() - LOCK_TIMEOUT_MS) },
    });

    await Lock.create({ key: LOCK_KEY, lockedAt: now });
    console.log("🔒 Lock acquired.");
    return true;
  } catch (error) {
    console.log("🔒 Lock acquisition failed.");
    return false;
  }
};

const releaseLock = async () => {
  try {
    await Lock.deleteOne({ key: LOCK_KEY });
    console.log("🔓 Lock released.");
  } catch (error) {
    console.error("Error releasing lock:", error);
  }
};