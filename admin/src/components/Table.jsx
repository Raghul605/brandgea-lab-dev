import React from "react";

export default function Table({ columns = [], data = [], onRowClick }) {
  return (
    <div className="table__wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key || c.accessor}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="table__empty">
                No data
              </td>
            </tr>
          )}
          {data.map((row) => (
            <tr
              key={row._id || JSON.stringify(row)}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? "table__row--clickable" : ""}
            >
              {columns.map((c) => {
                const value =
                  typeof c.accessor === "function" ? c.accessor(row) : row[c.accessor];
                return <td key={c.key || c.accessor}>{value}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
