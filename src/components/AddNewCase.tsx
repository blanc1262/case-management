import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CaseGroup, CaseRow } from "../types";
import {
  ArrowLeft,
  Save,
  Plus,
  User,
  FileText,
  AlertCircle,
} from "lucide-react";

export const AddNewCase: React.FC = () => {
  const navigate = useNavigate();
  const [currentYear, setCurrentYear] = useState<string>("");
  const [nextCaseNumber, setNextCaseNumber] = useState<string>("");

  useEffect(() => {
    const year = localStorage.getItem("currentYear") || "";
    setCurrentYear(year);

    // Calculate next case number
    const storedCases = localStorage.getItem(`cases_${year}`);
    const cases = storedCases ? JSON.parse(storedCases) : [];

    if (cases.length === 0) {
      setNextCaseNumber("1");
    } else {
      const allCaseNumbers = cases
        .flat()
        .map((row) => row.caseNo)
        .filter((caseNo) => caseNo && !isNaN(Number(caseNo)))
        .map((caseNo) => parseInt(caseNo));

      if (allCaseNumbers.length === 0) {
        setNextCaseNumber("1");
      } else {
        const maxCaseNumber = Math.max(...allCaseNumbers);
        setNextCaseNumber(String(maxCaseNumber + 1));
      }
    }
  }, []);

  const [formData, setFormData] = useState<Partial<CaseRow>>({
    caseNo: "",
    program: "",
    name: "",
    address: "",
    filedCases: "",
    complainant: "",
    nature: "",
    remarks: "",
    status: "PENDING",
  });

  const handleInputChange = (field: keyof CaseRow, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name) {
      alert("❌ Please fill in the required fields (Name is required)!");
      return;
    }

    // If no current year is set, use current year as default
    const yearToUse = currentYear || new Date().getFullYear().toString();

    if (!yearToUse) {
      alert("❌ Unable to determine year for case!");
      return;
    }

    console.log("=== DEBUG: Saving new case ===");
    console.log("Current year:", currentYear);
    console.log("Year to use:", yearToUse);
    console.log("Next case number:", nextCaseNumber);
    console.log("Form data:", formData);

    const newCaseGroup: CaseGroup = [
      {
        caseNo: formData.caseNo || nextCaseNumber,
        program: formData.program || "",
        name: formData.name || "",
        address: formData.address || "",
        filedCases: formData.filedCases || "",
        complainant: formData.complainant || "",
        nature: formData.nature || "",
        remarks: formData.remarks || "",
        status: formData.status || "PENDING",
      },
    ];

    console.log("New case group to save:", newCaseGroup);

    // Load existing cases
    const storedCases = localStorage.getItem(`cases_${yearToUse}`);
    const cases = storedCases ? JSON.parse(storedCases) : [];

    console.log("Existing cases count:", cases.length);
    console.log("Existing cases:", cases);

    // Add new case to the end
    cases.push(newCaseGroup);
    localStorage.setItem(`cases_${yearToUse}`, JSON.stringify(cases));

    console.log("After save - Total cases:", cases.length);

    // Verify it was saved
    const verifyCases = localStorage.getItem(`cases_${yearToUse}`);
    const parsedVerifyCases = verifyCases ? JSON.parse(verifyCases) : [];
    console.log("Verification - Saved cases count:", parsedVerifyCases.length);
    console.log(
      "Verification - Last case saved:",
      parsedVerifyCases[parsedVerifyCases.length - 1],
    );

    alert(
      `✅ Case ${newCaseGroup[0].caseNo} added successfully! Total cases now: ${cases.length}`,
    );

    // Navigate back to dashboard
    navigate("/dashboard");
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

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
                Back to Dashboard
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    Add New Case
                  </h1>
                  <p className="text-sm text-slate-500">
                    Create a new case record for {currentYear}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              Case will be added as:{" "}
              <span className="font-bold text-rose-600">#{nextCaseNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Case Information
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm">
                      <AlertCircle size={16} />
                      <span className="font-semibold">
                        Auto-assigned Case Number: {nextCaseNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Case Number */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Case Number (Auto-assigned)
                    </label>
                    <div
                      className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono font-bold bg-slate-100"
                      readOnly
                    >
                      {nextCaseNumber}
                    </div>
                  </div>

                  {/* Program */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Program
                    </label>
                    <input
                      type="text"
                      id="program"
                      name="program"
                      value={formData.program}
                      onChange={(e) =>
                        handleInputChange("program", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="e.g., SLP, 4Ps, Social Pension"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Full name"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Full address"
                    />
                  </div>

                  {/* Filed Cases */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Filed Cases
                    </label>
                    <input
                      type="text"
                      id="filedCases"
                      name="filedCases"
                      value={formData.filedCases}
                      onChange={(e) =>
                        handleInputChange("filedCases", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Case numbers or descriptions"
                    />
                  </div>

                  {/* Complainant */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Complainant
                    </label>
                    <textarea
                      id="complainant"
                      name="complainant"
                      value={formData.complainant}
                      onChange={(e) =>
                        handleInputChange("complainant", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[120px] resize-y"
                      placeholder="Name of complainant"
                    />
                  </div>

                  {/* Nature */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nature
                    </label>
                    <textarea
                      id="nature"
                      name="nature"
                      value={formData.nature}
                      onChange={(e) =>
                        handleInputChange("nature", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[200px] resize-y"
                      placeholder="Detailed description of case nature"
                    />
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Remarks
                    </label>
                    <textarea
                      id="remarks"
                      name="remarks"
                      value={formData.remarks}
                      onChange={(e) =>
                        handleInputChange("remarks", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[200px] resize-y"
                      placeholder="Additional remarks or notes"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="DISMISSED">DISMISSED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
                >
                  <Save size={18} />
                  Add New Case
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
