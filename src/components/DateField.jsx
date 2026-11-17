import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '../utils';
import DatePickerModal from './DatePickerModal';

export default function DateField({
  value,
  onChange,
  label,
  icon = faCalendarDays,
  dateFormat = 'th',
  showAgePreview = false,
  title,
  required = false,
  allowClear = false,
  minDate = null,
  maxDate = null,
  badge = null,
  compact = false,
  iconColor = 'text-paw-500',
  className = ''
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const displayDate = value ? formatDate(value, dateFormat) : '';

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className={`rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 flex items-center justify-between gap-2 hover:border-paw-400 hover:bg-paw-50/20 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-paw-500 active:scale-[0.99] ${className}`}
        >
          <span className={displayDate ? 'text-slate-900 font-bold tabular-nums truncate' : 'text-slate-400 font-normal truncate'}>
            {displayDate || 'เลือกวันที่...'}
          </span>
          <FontAwesomeIcon icon={icon} className="text-slate-400 text-xs flex-shrink-0" />
        </button>

        <DatePickerModal
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          value={value}
          onChange={onChange}
          title={title || label || 'เลือกวันที่'}
          dateFormat={dateFormat}
          showAgePreview={showAgePreview}
          allowClear={allowClear || (!required && !!value)}
          minDate={minDate}
          maxDate={maxDate}
        />
      </>
    );
  }

  return (
    <div className={`p-3 rounded-2xl bg-slate-50 border border-slate-100 ${className}`}>
      {label && (
        <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5 text-xs text-slate-700">
            <FontAwesomeIcon icon={icon} className={`text-xs ${iconColor}`} />
            <span>{label}</span>
            {required && <span className="text-rose-500 font-bold">*</span>}
          </span>
          {badge ? badge : (value && (
            <span className="text-[9px] font-mono text-slate-400 font-normal">
              {value}
            </span>
          ))}
        </div>
      )}

      {/* Interactive Trigger Button */}
      <button
        type="button"
        onClick={() => setIsPickerOpen(true)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 flex items-center justify-between hover:border-paw-400 hover:bg-paw-50/20 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-paw-500 active:scale-[0.99]"
      >
        <span className={displayDate ? 'text-slate-900' : 'text-slate-400 font-normal'}>
          {displayDate || 'เลือกวันที่...'}
        </span>
        <FontAwesomeIcon icon={faCalendarDays} className="text-slate-400 text-xs" />
      </button>

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        value={value}
        onChange={onChange}
        title={title || label || 'เลือกวันที่'}
        dateFormat={dateFormat}
        showAgePreview={showAgePreview}
        allowClear={allowClear || (!required && !!value)}
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  );
}
