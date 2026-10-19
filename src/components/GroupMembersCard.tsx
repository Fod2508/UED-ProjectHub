import React from "react";
import { Users, Crown, Mail } from "lucide-react";

interface GroupMember {
  id: string;
  name: string;
  email?: string;
  avatarText: string;
  role?: string;
  skills: string[];
  isLeader: boolean;
}

interface GroupMembersCardProps {
  members: GroupMember[];
  groupName: string;
  maxMembers?: number;
}

export const GroupMembersCard: React.FC<GroupMembersCardProps> = ({
  members,
  groupName,
  maxMembers = 4,
}) => {
  const currentCount = members.length;
  const isComplete = currentCount >= maxMembers;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{groupName}</h3>
            <p className="text-xs text-slate-500">
              {currentCount}/{maxMembers} thành viên
            </p>
          </div>
        </div>

        {isComplete ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Đã đủ</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Đang tuyển</span>
          </span>
        )}
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {members.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Chưa có thành viên nào</p>
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className={`p-4 rounded-xl border transition ${
                member.isLeader
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                    member.isLeader
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600"
                      : "bg-slate-600"
                  }`}
                >
                  {member.avatarText}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {member.name}
                    </h4>
                    {member.isLeader && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-semibold shrink-0">
                        <Crown className="w-3 h-3" />
                        <span>Trưởng nhóm</span>
                      </span>
                    )}
                  </div>

                  {member.email && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}

                  {member.role && (
                    <p className="text-xs text-slate-600 mb-2">{member.role}</p>
                  )}

                  {/* Skills */}
                  {member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {member.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 3 && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                          +{member.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Note */}
      {!isComplete && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Còn thiếu{" "}
            <strong className="text-blue-600">
              {maxMembers - currentCount}
            </strong>{" "}
            thành viên để hoàn thiện nhóm
          </p>
        </div>
      )}
    </div>
  );
};
