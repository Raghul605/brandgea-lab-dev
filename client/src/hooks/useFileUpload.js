import { useState, useCallback } from "react";

const useFileUpload = (maxFiles = 2, maxSize = 5 * 1024 * 1024) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (files.length + selectedFiles.length > maxFiles) {
      return { error: `You can only upload up to ${maxFiles} images.` };
    }

    const validFiles = [];
    const validationErrors = [];

    selectedFiles.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        validationErrors.push("Only JPEG, PNG, and WebP images are allowed.");
        return;
      }

      if (file.size > maxSize) {
        validationErrors.push("Each file must be under 5MB.");
        return;
      }

      validFiles.push(file);
    });

    if (validationErrors.length > 0) {
      return { error: validationErrors[0] };
    }

    // Create previews
    const previewPromises = validFiles.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(previewPromises).then((newPreviews) => {
      setPreviews((prev) => [...prev, ...newPreviews].slice(0, maxFiles));
      setFiles((prev) => [...prev, ...validFiles].slice(0, maxFiles));
    });

    e.target.value = "";
    return { success: true };
  }, [files, maxFiles, maxSize]);

  const handleRemoveFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const resetFiles = useCallback(() => {
    setFiles([]);
    setPreviews([]);
  }, []);

  return {
    files,
    previews,
    handleFileSelect,
    handleRemoveFile,
    resetFiles,
  };
};

export default useFileUpload;