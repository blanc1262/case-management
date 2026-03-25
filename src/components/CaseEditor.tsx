import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CaseGroup, CaseRow } from "../types";
import {
  ArrowLeft,
  Save,
  X,
  FileText,
  Edit3,
  Check,
  AlertCircle,
} from "lucide-react";

export const CaseEditor: React.FC = () => {
  const navigate = useNavigate();
  const [editingGroup, setEditingGroup] = useState<CaseGroup | null>(null);
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    field: string;
  } | null>(null);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [isNewCase, setIsNewCase] = useState(false);

  useEffect(() => {
    // Load the editing group from localStorage
    const stored = localStorage.getItem("editingGroup");
    const newCaseFlag = localStorage.getItem("isNewCase");

    if (stored) {
      setEditingGroup(JSON.parse(stored));
      setIsNewCase(newCaseFlag === "true");
      // Clear the new case flag
      localStorage.removeItem("isNewCase");
    } else {
      // If no data, redirect back to dashboard
      navigate("/dashboard");
    }
  }, [navigate]);

  const startEditing = (rowIndex: number, field: string, value: string) => {
    setEditingCell({ rowIndex, field });
    setFormData({ ...formData, [`${rowIndex}-${field}`]: value });
  };

  const saveCell = () => {
    if (!editingCell || !editingGroup) return;

    const { rowIndex, field } = editingCell;
    const key = `${rowIndex}-${field}`;
    const newValue = formData[key];

    // Update the data
    const updatedGroup = [...editingGroup];
    updatedGroup[rowIndex] = {
      ...updatedGroup[rowIndex],
      [field]: newValue,
    };

    setEditingGroup(updatedGroup);
    setEditingCell(null);
  };

  const cancelEdit = () => {
    setEditingCell(null);
  };

  const handleSave = () => {
    if (!editingGroup) return;

    // Get current year from localStorage
    const currentYear = localStorage.getItem("currentYear") || "";
    console.log("Saving case for year:", currentYear);

    if (currentYear) {
      // Load existing cases
      const storedCases = localStorage.getItem(`cases_${currentYear}`);
      const cases = storedCases ? JSON.parse(storedCases) : [];
      console.log("Loaded existing cases:", cases.length);

      if (isNewCase) {
        // Simple: just add the new case
        cases.push(editingGroup);
        localStorage.setItem(`cases_${currentYear}`, JSON.stringify(cases));

        console.log("After save - Total cases:", cases.length);
        alert(
          `✅ Case ${editingGroup[0].caseNo} saved! Total cases now: ${cases.length}`,
        );

        // Force reload the page to see the new case
        window.location.href = "/dashboard";
        return; // Stop here - don't do anything else
      } else {
        // For existing cases, find and update the edited group
        const originalGroup = JSON.parse(
          localStorage.getItem("editingGroup") || "[]",
        );
        const idx = cases.findIndex(
          (group: CaseGroup) =>
            group.length === originalGroup.length &&
            group[0]?.caseNo === originalGroup[0]?.caseNo,
        );

        if (idx !== -1) {
          cases[idx] = editingGroup;
          localStorage.setItem(`cases_${currentYear}`, JSON.stringify(cases));
        }
      }
    }

    // Clear editing group from localStorage
    localStorage.removeItem("editingGroup");

    // Navigate back to dashboard
    navigate("/dashboard", { state: { activeSection: "cases" } });
  };

  const handleCancel = () => {
    // Clear the editing group from localStorage
    localStorage.removeItem("editingGroup");

    // Navigate back to dashboard with cases tab active
    navigate("/dashboard", { state: { activeSection: "cases" } });
  };

  const formatCellContent = (value: string) => {
    return value
      .split("◼")
      .filter((p) => p.trim() !== "")
      .map((p) => p.trim())
      .join(", ");
  };

  if (!editingGroup) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
              >
                <ArrowLeft size={18} />
                Back to Cases
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    {isNewCase ? "Create New Case" : "Case Editor"}
                  </h1>
                  <p className="text-sm text-slate-500">
                    {isNewCase
                      ? "Fill in the case details below"
                      : "Click any cell to edit"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm">
                <AlertCircle size={16} />
                {editingGroup.length} rows
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Case Info Bar */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                  Case Number
                </span>
                <p className="text-lg font-bold text-rose-700">
                  {editingGroup[0]?.caseNo || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Program
                </span>
                <p className="text-lg font-bold text-slate-700">
                  {editingGroup[0]?.program || "N/A"}
                </p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              <Edit3 size={16} className="inline mr-2" />
              {isNewCase
                ? "Fill in the case information"
                : "Click any cell to edit its content"}
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="w-16 p-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200">
                    #
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200 min-w-[120px]">
                    Case No.
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200 min-w-[120px]">
                    Program
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200 min-w-[150px]">
                    Name
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200 min-w-[300px]">
                    Address
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200 min-w-[200px]">
                    Filed
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200 min-w-[200px]">
                    Complainant
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200 min-w-[300px]">
                    Nature
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200 min-w-[400px]">
                    Remarks
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider min-w-[160px]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {editingGroup.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 text-center font-bold text-slate-400 border-r border-slate-100">
                      {rIdx + 1}
                    </td>
                    {[
                      "caseNo",
                      "program",
                      "name",
                      "address",
                      "filedCases",
                      "complainant",
                      "nature",
                      "remarks",
                      "status",
                    ].map((f) => (
                      <td
                        key={f}
                        className={`p-4 border-r border-slate-100 ${
                          editingCell?.rowIndex === rIdx &&
                          editingCell?.field === f
                            ? "bg-rose-50"
                            : "hover:bg-slate-50"
                        } transition-colors cursor-pointer`}
                        onClick={() => {
                          if (f !== "status") {
                            startEditing(rIdx, f, row[f as keyof CaseRow]);
                          }
                        }}
                      >
                        {editingCell?.rowIndex === rIdx &&
                        editingCell?.field === f ? (
                          <div className="flex items-center gap-2">
                            {f === "nature" ||
                            f === "remarks" ||
                            f === "complainant" ? (
                              <textarea
                                id={`${f}-${rIdx}`}
                                name={f}
                                value={formData[`${rIdx}-${f}`] || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    [`${rIdx}-${f}`]: e.target.value,
                                  })
                                }
                                className={`flex-1 px-4 py-3 bg-white border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                                  f === "complainant"
                                    ? "min-h-[120px]"
                                    : "min-h-[200px]"
                                } resize-y`}
                                autoFocus
                              />
                            ) : (
                              <input
                                type="text"
                                id={`${f}-${rIdx}`}
                                name={f}
                                value={formData[`${rIdx}-${f}`] || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    [`${rIdx}-${f}`]: e.target.value,
                                  })
                                }
                                className="flex-1 px-4 py-3 bg-white border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[80px]"
                                autoFocus
                              />
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                saveCell();
                              }}
                              className="p-1 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelEdit();
                              }}
                              className="p-1 bg-slate-300 text-white rounded hover:bg-slate-400 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : f === "status" ? (
                          <div className="relative">
                            <select
                              value={row[f as keyof CaseRow]}
                              onChange={(e) => {
                                const updatedGroup = [...editingGroup];
                                updatedGroup[rIdx] = {
                                  ...updatedGroup[rIdx],
                                  [f]: e.target.value,
                                };
                                setEditingGroup(updatedGroup);
                              }}
                              className={`w-full px-4 py-3 font-semibold text-sm rounded-lg border-2 focus:outline-none focus:ring-2 transition-all cursor-pointer appearance-none bg-white
                                ${
                                  row[f as keyof CaseRow] === "RESOLVED"
                                    ? "border-emerald-300 text-emerald-700 focus:ring-emerald-500"
                                    : row[f as keyof CaseRow] === "DISMISSED"
                                      ? "border-red-300 text-red-700 focus:ring-red-500"
                                      : "border-yellow-300 text-yellow-700 focus:ring-yellow-500"
                                }`}
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right 12px center",
                                paddingRight: "40px",
                              }}
                            >
                              <option value="DISMISSED">DISMISSED</option>
                              <option value="PENDING">PENDING</option>
                              <option value="RESOLVED">RESOLVED</option>
                            </select>
                          </div>
                        ) : (
                          <div className="min-h-[40px] flex items-center">
                            <span className="text-sm text-slate-700">
                              {formatCellContent(row[f as keyof CaseRow]) || (
                                <span className="text-slate-400 italic">
                                  Click to edit
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Editing {editingGroup.length} row
            {editingGroup.length !== 1 ? "s" : ""} • Changes are saved when you
            click "Save Changes"
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
            >
              <Save size={18} />
              Save All Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
