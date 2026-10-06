import React, { useState } from 'react';
import {
  Users,
  Clock,
  DollarSign,
  Plus,
  Printer,
  Calendar,
  CheckCircle,
  Briefcase,
  AlertCircle,
  Smartphone,
  MapPin,
  Camera,
  ExternalLink,
  QrCode,
  Check,
} from 'lucide-react';
import { Staff, Timecard, Store } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { buildStaffClockInUrl } from '../../utils/urlHelper';
import { QRCodeModal } from '../Modals/QRCodeModal';

interface StaffPayrollProps {
  store: Store;
  staffList: Staff[];
  timecards: Timecard[];
  onUpdateTimecards: (timecards: Timecard[]) => void;
  onUpdateStaffList: (staff: Staff[]) => void;
  isStaffOnlyView?: boolean;
  onOpenMobileClockIn?: () => void;
}

export const StaffPayroll: React.FC<StaffPayrollProps> = ({
  store,
  staffList,
  timecards,
  onUpdateTimecards,
  onUpdateStaffList,
  isStaffOnlyView = false,
  onOpenMobileClockIn,
}) => {
  const [activeTab, setActiveTab] = useState<'timeclock' | 'payroll' | 'staff'>('timeclock');
  const [selectedStaffForModal, setSelectedStaffForModal] = useState<Staff | null>(null);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<Staff['role']>('Cook / Kitchen Staff');
  const [newStaffHourly, setNewStaffHourly] = useState<number>(75);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { isDark } = useTheme();
  const staffClockInUrl = buildStaffClockInUrl(store.id);

  const storeStaff = staffList.filter((s) => s.storeId === store.id);
  const storeTimecards = timecards.filter((t) => t.storeId === store.id);

  // Clock In action
  const handleClockIn = (staff: Staff) => {
    const existingActive = storeTimecards.find(
      (t) => t.staffId === staff.id && !t.isCompleted
    );

    if (existingActive) {
      setStatusMessage(`${staff.name} is already clocked in!`);
      setTimeout(() => setStatusMessage(null), 2500);
      return;
    }

    const newTimecard: Timecard = {
      id: `tc-${Date.now()}`,
      staffId: staff.id,
      staffName: staff.name,
      storeId: store.id,
      date: new Date().toISOString().split('T')[0],
      clockIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      regularHours: 8,
      overtimeHours: 0,
      isCompleted: false,
    };

    onUpdateTimecards([newTimecard, ...timecards]);
    setStatusMessage(`Clock In recorded for ${staff.name}!`);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  // Clock Out action
  const handleClockOut = (staff: Staff) => {
    const active = storeTimecards.find((t) => t.staffId === staff.id && !t.isCompleted);
    if (!active) {
      setStatusMessage(`${staff.name} has not clocked in yet!`);
      setTimeout(() => setStatusMessage(null), 2500);
      return;
    }

    const updated = timecards.map((t) => {
      if (t.id === active.id) {
        return {
          ...t,
          clockOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isCompleted: true,
        };
      }
      return t;
    });

    onUpdateTimecards(updated);
    setStatusMessage(`Clock Out completed for ${staff.name}! Hours recorded for payroll.`);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  // Add new staff member
  const handleAddStaff = () => {
    if (!newStaffName.trim()) return;

    const newMember: Staff = {
      id: `staff-${Date.now()}`,
      storeId: store.id,
      name: newStaffName.trim(),
      role: newStaffRole,
      hourlyRate: newStaffHourly,
      dailyRate: newStaffHourly * 8,
      contact: '+63 900 000 0000',
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=200`,
    };

    onUpdateStaffList([...staffList, newMember]);
    setNewStaffName('');
    setIsAddingStaff(false);
    setStatusMessage(`Staff member ${newMember.name} added!`);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  // Compute payroll summary per staff
  const payrollSummaries = storeStaff.map((staff) => {
    const cards = storeTimecards.filter((t) => t.staffId === staff.id);
    const totalRegularHours = cards.reduce((sum, c) => sum + (c.regularHours || 0), 0);
    const totalOvertimeHours = cards.reduce((sum, c) => sum + (c.overtimeHours || 0), 0);

    const regularPay = totalRegularHours * staff.hourlyRate;
    const overtimeRate = staff.hourlyRate * 1.25; // 125% standard overtime rate
    const overtimePay = totalOvertimeHours * overtimeRate;
    const grossPay = regularPay + overtimePay;
    const deductions = Math.round(grossPay * 0.03); // SSS / PhilHealth / Pag-IBIG deduction
    const netSalary = grossPay - deductions;

    return {
      staff,
      cardsCount: cards.length,
      totalRegularHours,
      totalOvertimeHours,
      grossPay,
      deductions,
      netSalary,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">
            <Users className="w-4 h-4" />
            <span>{isStaffOnlyView ? 'Daily Punch Clock Terminal' : 'Timekeeping & Automated Payroll'}</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {isStaffOnlyView ? 'Staff Clock In & Out Terminal' : 'Staff Timecard & Salary Computation'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isStaffOnlyView
              ? 'Record shift start, break, and clock-out attendance. All hours logged automatically for manager payroll.'
              : 'Record kitchen and front-of-house staff clock in/out, overtime, and automatic net salary calculations.'}
          </p>
        </div>

        {!isStaffOnlyView && (
          <button
            onClick={() => setIsAddingStaff(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Store Staff</span>
          </button>
        )}
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tabs */}
      {!isStaffOnlyView && (
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl text-xs font-bold w-fit">
          <button
            onClick={() => setActiveTab('timeclock')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'timeclock'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Live Clock In / Out Terminal
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'payroll'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Salary & Payroll Computation
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Staff Directory & Wage Rates
          </button>
        </div>
      )}

      {/* Tab 1: Live Clock In / Clock Out Screen */}
      {activeTab === 'timeclock' && (
        <div className="space-y-4">
          {/* Mobile Phone Attendance Feature Banner */}
          <div className="p-4 bg-linear-to-r from-orange-50 via-amber-50 to-emerald-50 border border-orange-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-600/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900">
                  Staff Mobile Clock-In Station (GPS Longitude & Latitude + Selfie Verification)
                </h4>
                <p className="text-[11px] text-gray-600">
                  Staff can clock in/out directly from their own smartphones with automated geolocation and front camera picture proof.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(staffClockInUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : null}
                <span>{copiedLink ? 'Copied Link!' : 'Copy Phone Link'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsQrOpen(true)}
                className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-emerald-400 hover:bg-slate-800'
                    : 'bg-white border-slate-200 text-emerald-700 hover:bg-slate-50'
                }`}
                title="Show Staff QR Code"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code</span>
              </button>
              {onOpenMobileClockIn && (
                <button
                  type="button"
                  onClick={onOpenMobileClockIn}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Open Phone Clock-In
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storeStaff.map((staff) => {
              const activeCard = storeTimecards.find(
                (t) => t.staffId === staff.id && !t.isCompleted
              );
              const isClockedIn = !!activeCard;

              return (
                <div
                  key={staff.id}
                  className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={staff.avatarUrl}
                            alt={staff.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-900">{staff.name}</h4>
                          <span className="text-[11px] text-gray-500 block">{staff.role}</span>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          isClockedIn
                            ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {isClockedIn ? '● ON DUTY' : 'OFF DUTY'}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-1.5 text-xs mb-4">
                      <div className="flex justify-between text-gray-600">
                        <span>Rate:</span>
                        <strong className="text-gray-900">₱{staff.hourlyRate}/hr (₱{staff.dailyRate}/day)</strong>
                      </div>
                      {isClockedIn && (
                        <div className="space-y-1 pt-1 border-t border-gray-200">
                          <div className="flex justify-between text-emerald-700 font-semibold">
                            <span>Time In:</span>
                            <span>{activeCard.clockIn}</span>
                          </div>

                          {/* GPS Verification Badge */}
                          {activeCard.clockInLat && activeCard.clockInLng && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                              <span>GPS: {activeCard.clockInLat}, {activeCard.clockInLng}</span>
                            </div>
                          )}

                          {/* Selfie Picture Thumbnail */}
                          {activeCard.clockInPhoto && (
                            <div className="flex items-center gap-2 pt-1">
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-emerald-300 shrink-0 bg-black">
                                <img
                                  src={activeCard.clockInPhoto}
                                  alt="Clock-in Selfie"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                                <Camera className="w-3 h-3 text-emerald-600" />
                                <span>Selfie Verified</span>
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleClockIn(staff)}
                      disabled={isClockedIn}
                      className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
                    >
                      Clock IN
                    </button>

                    <button
                      onClick={() => handleClockOut(staff)}
                      disabled={!isClockedIn}
                      className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
                    >
                      Clock OUT
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Salary Computation & Printable Payslip */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Automated Bi-Monthly / Daily Salary Breakdown
                </h3>
                <p className="text-[11px] text-gray-500">
                  Calculated automatically: Regular Pay + Overtime (1.25x) - Statutory Deductions.
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print All Payslips</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Staff Member</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-center">Hourly Rate</th>
                    <th className="p-4 text-center">Reg. Hours</th>
                    <th className="p-4 text-center">OT Hours</th>
                    <th className="p-4 text-right">Gross Pay</th>
                    <th className="p-4 text-right text-red-600">Deductions</th>
                    <th className="p-4 text-right font-black text-gray-900">Net Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payrollSummaries.map((p) => (
                    <tr key={p.staff.id} className="hover:bg-gray-50/80">
                      <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={p.staff.avatarUrl}
                            alt={p.staff.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span>{p.staff.name}</span>
                      </td>
                      <td className="p-4 text-gray-600">{p.staff.role}</td>
                      <td className="p-4 text-center font-medium">₱{p.staff.hourlyRate}</td>
                      <td className="p-4 text-center font-bold text-gray-800">
                        {p.totalRegularHours} hrs
                      </td>
                      <td className="p-4 text-center font-bold text-amber-600">
                        {p.totalOvertimeHours} hrs
                      </td>
                      <td className="p-4 text-right font-semibold text-gray-800">
                        ₱{p.grossPay.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-medium text-red-600">
                        -₱{p.deductions.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-black text-sm text-emerald-600">
                        ₱{p.netSalary.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Staff Directory */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {storeStaff.map((staff) => (
            <div
              key={staff.id}
              className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src={staff.avatarUrl}
                    alt={staff.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900">{staff.name}</h4>
                  <span className="text-xs text-gray-500 block">{staff.role}</span>
                  <span className="text-[11px] font-bold text-orange-600">
                    ₱{staff.hourlyRate}/hour • ₱{staff.dailyRate}/day
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddingStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-black text-gray-900">Add Staff Member</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Maria Del Rosario"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Role</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as Staff['role'])}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option>Cook / Kitchen Staff</option>
                  <option>Cashier</option>
                  <option>Store Manager</option>
                  <option>Crew</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Hourly Rate (PHP)
                </label>
                <input
                  type="number"
                  value={newStaffHourly}
                  onChange={(e) => setNewStaffHourly(parseInt(e.target.value) || 60)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setIsAddingStaff(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                Save Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Clock-In QR Code Modal */}
      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={staffClockInUrl}
        title={`${store.name} Staff Clock-In`}
        subtitle="Staff can scan this code with their smartphone camera to punch in with GPS & selfie photo"
        badge="Staff Mobile QR"
        onTestInApp={onOpenMobileClockIn}
      />
    </div>
  );
};
