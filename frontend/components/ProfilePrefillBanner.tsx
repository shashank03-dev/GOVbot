import Link from 'next/link';
import { CheckCircle, AlertCircle, User, ChevronRight } from 'lucide-react';

type Props = {
  completeness: number;
  filledFields: string[];
  missingFields: string[];
  profileHref?: string;
};

export default function ProfilePrefillBanner({ completeness, filledFields, missingFields, profileHref = '/profile' }: Props) {
  if (completeness === 0) return null;

  return (
    <div className={`rounded-2xl border p-4 mb-4 ${completeness >= 80 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-lg ${completeness >= 80 ? 'bg-emerald-100' : 'bg-amber-100'}`}>
          <User size={16} className={completeness >= 80 ? 'text-emerald-600' : 'text-amber-600'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className={`text-xs font-semibold ${completeness >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {completeness >= 80
                ? `✅ ${filledFields.length} fields auto-filled from your profile`
                : `⚡ ${filledFields.length} fields auto-filled — ${missingFields.length} still needed`}
            </p>
            <Link
              href={profileHref}
              className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold ${completeness >= 80 ? 'text-emerald-600 hover:text-emerald-800' : 'text-amber-600 hover:text-amber-800'} transition-colors`}
            >
              Edit Profile <ChevronRight size={12} />
            </Link>
          </div>

          {filledFields.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {filledFields.map(f => (
                <span
                  key={f}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${completeness >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                >
                  <CheckCircle size={9} />
                  {f.replace(/_/g, ' ')}
                </span>
              ))}
              {missingFields.slice(0, 3).map(f => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500"
                >
                  <AlertCircle size={9} />
                  {f.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
