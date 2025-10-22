// import { useEffect, useMemo, useState } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";

// /**
//  * 🔒 Replace with real API later:
//  *   POST /invites/verify { inviteCode } -> { tenantName, allowedRoles, allowedDomains }
//  */
// async function verifyInvite(inviteCode) {
//   const MOCK = {
//     // invite → allowed roles + email domains
//     ABC123: {
//       tenantName: "Springfield College",
//       roles: ["student", "faculty"],
//       domains: ["spring.edu"],
//     },
//     ADMIN42: {
//       tenantName: "Springfield College",
//       roles: ["admin"],
//       domains: ["spring.edu"],
//     },
//     XYZ999: {
//       tenantName: "TechVille Institute",
//       roles: ["student", "faculty", "admin"],
//       domains: ["techville.ac.in"],
//     },
//   };
//   const rec = MOCK[(inviteCode || "").trim()];
//   await new Promise((r) => setTimeout(r, 250)); // simulate latency
//   if (!rec) return { ok: false, message: "Invalid or expired invite code." };
//   return {
//     ok: true,
//     tenantName: rec.tenantName,
//     allowedRoles: rec.roles,
//     allowedDomains: rec.domains,
//   };
// }

// /* -------------------------- Validation -------------------------- */

// const passwordRules =
//   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,}$/;

// const SignupSchema = z
//   .object({
//     inviteCode: z.string().min(3, "Invite code is required"),
//     role: z.enum(["student", "faculty", "admin"], {
//       required_error: "Select a role",
//     }),
//     fullName: z.string().min(2, "Enter your full name"),
//     email: z.string().email("Enter a valid email"),
//     password: z
//       .string()
//       .min(8, "At least 8 characters")
//       .regex(passwordRules, "Include upper, lower & a number"),
//     confirmPassword: z.string().min(8, "Confirm your password"),
//     tos: z.literal(true, {
//       errorMap: () => ({ message: "You must accept Terms & Privacy" }),
//     }),
//   })
//   .refine((d) => d.password === d.confirmPassword, {
//     path: ["confirmPassword"],
//     message: "Passwords do not match",
//   });

// export default function Signup() {
//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors, isSubmitting },
//     setError,
//     clearErrors,
//   } = useForm({
//     resolver: zodResolver(SignupSchema),
//     mode: "onChange",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [inviteInfo, setInviteInfo] = useState({
//     status: "idle", // idle | checking | ok | error
//     tenantName: undefined,
//     allowedRoles: undefined,
//     allowedDomains: undefined,
//     message: undefined,
//   });

//   const inviteCode = watch("inviteCode");
//   const selectedRole = watch("role");
//   const email = watch("email");

//   // verify invite on the fly
//   useEffect(() => {
//     if (!inviteCode || inviteCode.trim().length < 3) {
//       setInviteInfo({ status: "idle" });
//       return;
//     }
//     let cancelled = false;
//     (async () => {
//       setInviteInfo({ status: "checking" });
//       const res = await verifyInvite(inviteCode);
//       if (cancelled) return;
//       if (res.ok)
//         setInviteInfo({
//           status: "ok",
//           tenantName: res.tenantName,
//           allowedRoles: res.allowedRoles,
//           allowedDomains: res.allowedDomains,
//         });
//       else setInviteInfo({ status: "error", message: res.message });
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [inviteCode]);

//   // derive email domain
//   const emailDomain = useMemo(() => {
//     const v = (email || "").trim().toLowerCase();
//     const at = v.lastIndexOf("@");
//     return at > -1 ? v.slice(at + 1) : "";
//   }, [email]);

//   const onSubmit = async (data) => {
//     if (inviteInfo.status !== "ok") {
//       setError("inviteCode", {
//         type: "manual",
//         message: inviteInfo.message || "Invalid invite code",
//       });
//       return;
//     }
//     const { allowedDomains = [], allowedRoles = [] } = inviteInfo;

//     // role must be allowed by invite
//     if (!allowedRoles.includes(data.role)) {
//       setError("role", {
//         type: "manual",
//         message: `Role not allowed by this invite. Allowed: ${allowedRoles.join(
//           ", "
//         )}`,
//       });
//       return;
//     }

//     // email domain must match
//     if (
//       !emailDomain ||
//       !allowedDomains.some((d) => emailDomain === d.toLowerCase())
//     ) {
//       setError("email", {
//         type: "manual",
//         message: `Use your institute email (${allowedDomains.join(" / ")})`,
//       });
//       return;
//     }

//     clearErrors();

//     // 🔗 Replace with real API:
//     // await api.post('/auth/signup', { ...data, inviteCode: data.inviteCode })
//     console.log("SIGNUP OK → send to API:", {
//       inviteCode: data.inviteCode,
//       role: data.role,
//       fullName: data.fullName,
//       email: data.email,
//       password: "[REDACTED]",
//     });

//     alert("Signup successful (mock). Next: wire /auth/signup API.");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 px-4 py-8 grid place-items-center">
//       <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
//         {/* Brand */}
//         <div className="mb-6 text-center">
//           <h1 className="text-2xl font-semibold">Create your account</h1>
//           <p className="text-sm text-gray-500">
//             Join your institute’s workspace
//           </p>
//         </div>

//         <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
//           {/* Invite Code */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Invite Code
//             </label>
//             <input
//               {...register("inviteCode")}
//               placeholder="e.g., ABC123"
//               className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//             {errors.inviteCode && (
//               <p className="text-sm text-red-600 mt-1">
//                 {errors.inviteCode.message}
//               </p>
//             )}

//             {/* Invite status */}
//             {inviteInfo.status === "checking" && (
//               <p className="text-xs text-gray-500 mt-1">Validating invite…</p>
//             )}
//             {inviteInfo.status === "ok" && (
//               <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
//                 <div>
//                   <span className="font-medium">Institute:</span>{" "}
//                   {inviteInfo.tenantName}
//                 </div>
//                 <div>
//                   <span className="font-medium">Allowed roles:</span>{" "}
//                   {inviteInfo.allowedRoles?.join(", ")}
//                 </div>
//                 <div>
//                   <span className="font-medium">Email domain:</span>{" "}
//                   {inviteInfo.allowedDomains?.join(" / ")}
//                 </div>
//               </div>
//             )}
//             {inviteInfo.status === "error" && (
//               <p className="text-xs text-red-600 mt-1">{inviteInfo.message}</p>
//             )}
//           </div>

//           {/* Role */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               I am a
//             </label>
//             <select
//               {...register("role")}
//               defaultValue="student"
//               className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
//             >
//               <option value="student">Student</option>
//               <option value="faculty">Faculty</option>
//               <option value="admin">Admin</option>
//             </select>
//             {errors.role && (
//               <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
//             )}
//             {inviteInfo.status === "ok" &&
//               inviteInfo.allowedRoles &&
//               selectedRole &&
//               !inviteInfo.allowedRoles.includes(selectedRole) && (
//                 <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
//                   This invite doesn’t allow “{selectedRole}”. Allowed:{" "}
//                   {inviteInfo.allowedRoles.join(", ")}.
//                 </p>
//               )}
//           </div>

//           {/* Full Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Full Name
//             </label>
//             <input
//               {...register("fullName")}
//               placeholder="Your full name"
//               className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//             {errors.fullName && (
//               <p className="text-sm text-red-600 mt-1">
//                 {errors.fullName.message}
//               </p>
//             )}
//           </div>

//           {/* Email */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Institute Email
//             </label>
//             <input
//               {...register("email")}
//               type="email"
//               placeholder="you@institute.edu"
//               className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//             {errors.email && (
//               <p className="text-sm text-red-600 mt-1">
//                 {errors.email.message}
//               </p>
//             )}
//             {inviteInfo.status === "ok" &&
//               inviteInfo.allowedDomains?.length > 0 && (
//                 <p className="text-xs text-gray-500 mt-1">
//                   Must be: {inviteInfo.allowedDomains.join(" / ")}
//                   {emailDomain && ` • You entered: ${emailDomain}`}
//                 </p>
//               )}
//           </div>

//           {/* Password */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 {...register("password")}
//                 type={showPassword ? "text" : "password"}
//                 placeholder="••••••••"
//                 className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword((s) => !s)}
//                 className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
//               >
//                 {showPassword ? "Hide" : "Show"}
//               </button>
//             </div>
//             {errors.password && (
//               <p className="text-sm text-red-600 mt-1">
//                 {errors.password.message}
//               </p>
//             )}
//             <p className="text-xs text-gray-500 mt-1">
//               Min 8 chars, include upper, lower & a number.
//             </p>
//           </div>

//           {/* Confirm */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Confirm Password
//             </label>
//             <input
//               {...register("confirmPassword")}
//               type="password"
//               placeholder="••••••••"
//               className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//             {errors.confirmPassword && (
//               <p className="text-sm text-red-600 mt-1">
//                 {errors.confirmPassword.message}
//               </p>
//             )}
//           </div>

//           {/* Terms */}
//           <label className="flex items-start gap-2 text-sm text-gray-700">
//             <input type="checkbox" {...register("tos")} className="mt-1" />
//             <span>
//               I agree to the{" "}
//               <a className="text-indigo-600 underline" href="#">
//                 Terms
//               </a>{" "}
//               &{" "}
//               <a className="text-indigo-600 underline" href="#">
//                 Privacy Policy
//               </a>
//               .
//             </span>
//           </label>
//           {errors.tos && (
//             <p className="text-sm text-red-600">{errors.tos.message}</p>
//           )}

//           {/* Submit */}
//           <button
//             disabled={isSubmitting}
//             type="submit"
//             className="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
//           >
//             {isSubmitting ? "Creating account…" : "Create account"}
//           </button>

//           <p className="text-center text-sm text-gray-600">
//             Already have an account?{" "}
//             <a href="/login" className="text-indigo-600 font-medium hover:underline">
//               Log in
//             </a>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }






import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/* -------------------- enums (match Prisma) -------------------- */
const RoleType = {
  STUDENT: "STUDENT",
  FACULTY: "FACULTY",
  PARENT: "PARENT",
  ADMIN: "ADMIN",
};

const InstitutionType = {
  SCHOOL: "SCHOOL",
  COLLEGE: "COLLEGE",
};

/* -------------------- schema per role -------------------- */
const baseSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Include upper, lower & a number"),
  confirmPassword: z.string().min(8, "Confirm your password"),
  roleType: z.nativeEnum(RoleType),
  inviteCode: z.string().min(3, "Invite code is required"),
  phone: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

const studentSchoolSchema = z.object({
  institutionType: z.literal(InstitutionType.SCHOOL),
  schoolName: z.string().min(2, "Enter school name"),
  board: z.string().optional(),
  className: z.string().min(1, "Enter class"),
  section: z.string().optional(),
  rollNo: z.string().min(1, "Enter roll no"),
  dob: z.string().min(1, "Select DOB"),
});

const studentCollegeSchema = z.object({
  institutionType: z.literal(InstitutionType.COLLEGE),
  collegeName: z.string().min(2, "Enter college name"),
  department: z.string().min(2, "Enter department"),
  yearOfStudy: z.coerce.number().int().min(1).max(8),
  semester: z.coerce.number().int().min(1).max(12).optional(),
  regNo: z.string().min(1, "Enter registration/roll no"),
});

const facultySchoolSchema = z.object({
  institutionType: z.literal(InstitutionType.SCHOOL),
  schoolName: z.string().min(2, "Enter school name"),
  subject: z.string().min(2, "Enter subject"),
});

const facultyCollegeSchema = z.object({
  institutionType: z.literal(InstitutionType.COLLEGE),
  collegeName: z.string().min(2, "Enter college name"),
  department: z.string().min(2, "Enter department"),
});

const parentSchema = z.object({
  // no institutionType required here; optional fields below are provisional
  studentName: z.string().optional(),
  studentClass: z.string().optional(),
  studentRollNo: z.string().optional(),
  studentDob: z.string().optional(),
  phone: z.string().min(7, "Enter phone").optional(),
});

const adminSchema = z.object({
  institutionType: z.nativeEnum(InstitutionType).optional(),
  institutionName: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(), // for college admins
});

/* -------------------- pick schema based on role/type -------------------- */
function makeSchema(roleType, instType) {
  if (roleType === RoleType.STUDENT) {
    return baseSchema.and(
      instType === InstitutionType.COLLEGE ? studentCollegeSchema : studentSchoolSchema
    );
  }
  if (roleType === RoleType.FACULTY) {
    return baseSchema.and(
      instType === InstitutionType.COLLEGE ? facultyCollegeSchema : facultySchoolSchema
    );
  }
  if (roleType === RoleType.PARENT) {
    return baseSchema.and(parentSchema);
  }
  if (roleType === RoleType.ADMIN) {
    return baseSchema.and(adminSchema);
  }
  return baseSchema;
}

/* -------------------- helper: build API payload -------------------- */
function buildPayload(values) {
  const {
    fullName, email, password, roleType, inviteCode, phone,
    institutionType, // maybe undefined for Parent/Admin
    // student (school)
    schoolName, board, className, section, rollNo, dob,
    // student (college)
    collegeName, department, yearOfStudy, semester, regNo,
    // faculty
    subject,
    // parent provisional
    studentName, studentClass, studentRollNo, studentDob,
    // admin
    institutionName, designation,
  } = values;

  const payload = {
    inviteCode,
    user: {
      fullName,
      email,
      password,
      roleType,
      phone: phone || null,
    },
    // optional top-level institution hint (you may link later on backend)
    institution: institutionType
      ? { type: institutionType, name: institutionName || schoolName || collegeName || null }
      : null,
    profile: {},
  };

  if (roleType === RoleType.STUDENT) {
    if (institutionType === InstitutionType.SCHOOL) {
      payload.profile = {
        kind: "studentSchool",
        data: {
          schoolName,
          board: board || null,
          class: className,
          section: section || null,
          rollNo,
          dob, // backend: convert to Date
        },
      };
    } else {
      payload.profile = {
        kind: "studentCollege",
        data: {
          collegeName,
          department,
          yearOfStudy: Number(yearOfStudy),
          semester: semester ? Number(semester) : null,
          regNo,
        },
      };
    }
  } else if (roleType === RoleType.FACULTY) {
    if (institutionType === InstitutionType.SCHOOL) {
      payload.profile = {
        kind: "facultySchool",
        data: { schoolName, subject },
      };
    } else {
      payload.profile = {
        kind: "facultyCollege",
        data: { collegeName, department },
      };
    }
  } else if (roleType === RoleType.PARENT) {
    payload.profile = {
      kind: "parent",
      data: {
        phone: phone || null,
        provisionalStudentName: studentName || null,
        provisionalStudentClass: studentClass || null,
        provisionalStudentRollNo: studentRollNo || null,
        provisionalStudentDob: studentDob || null,
      },
    };
  } else if (roleType === RoleType.ADMIN) {
    payload.profile = {
      kind: "admin",
      data: {
        institutionType: institutionType || null,
        institutionName: institutionName || null,
        designation: designation || null,
        department: department || null,
      },
    };
  }

  return payload;
}

/* -------------------- component -------------------- */
export default function Signup() {
  const [roleType, setRoleType] = useState(RoleType.STUDENT);
  const [institutionType, setInstitutionType] = useState(InstitutionType.SCHOOL);

  const schema = useMemo(() => makeSchema(roleType, institutionType), [roleType, institutionType]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    resetField,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      roleType,
      institutionType,
    },
  });

  // keep RHF aware of role/type
  const onChangeRole = (e) => {
    const rt = e.target.value;
    setRoleType(rt);
  };
  const onChangeInst = (e) => {
    const it = e.target.value;
    setInstitutionType(it);
    // clear fields when switching
    resetField("schoolName");
    resetField("collegeName");
    resetField("department");
    resetField("subject");
  };

  const onSubmit = async (values) => {
    const payload = buildPayload(values);
    console.log("Signup payload →", payload);

    // TODO: call your backend
    // const res = await fetch("/api/auth/signup", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload),
    // });
    // const data = await res.json();
    // handle errors/success…

    alert("Submitted (mock). Check console for payload.");
  };

  // convenience
  const E = ({ name }) => errors?.[name]?.message && (
    <p className="text-sm text-red-600 mt-1">{errors[name].message}</p>
  );

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold text-center mb-2">Create your account</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Sign up with role-specific details</p>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Role */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">I am a</label>
              <select
                {...register("roleType")}
                defaultValue={roleType}
                onChange={onChangeRole}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value={RoleType.STUDENT}>Student</option>
                <option value={RoleType.FACULTY}>Faculty</option>
                <option value={RoleType.PARENT}>Parent</option>
                <option value={RoleType.ADMIN}>Admin</option>
              </select>
              <E name="roleType" />
            </div>

            {/* Institution type (not needed for Parent usually, but allowed for Admin) */}
            {(roleType === RoleType.STUDENT || roleType === RoleType.FACULTY || roleType === RoleType.ADMIN) && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Institution Type</label>
                <select
                  {...register("institutionType")}
                  defaultValue={institutionType}
                  onChange={onChangeInst}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={InstitutionType.SCHOOL}>School</option>
                  <option value={InstitutionType.COLLEGE}>College</option>
                </select>
                <E name="institutionType" />
              </div>
            )}
          </div>

          {/* Name + Email */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input {...register("fullName")} className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
              <E name="fullName" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" {...register("email")} className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
              <E name="email" />
            </div>
          </div>

          {/* Invite */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Invite Code</label>
            <input {...register("inviteCode")} placeholder="e.g., ABC123" className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            <E name="inviteCode" />
          </div>

          {/* Phone (useful for Parent; optional otherwise) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
            <input {...register("phone")} className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            <E name="phone" />
          </div>

          {/* ===================== Role-specific fields ===================== */}
          {roleType === RoleType.STUDENT && (
            <>
              {watch("institutionType") === InstitutionType.SCHOOL ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">School Name</label>
                    <input {...register("schoolName")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                    <E name="schoolName" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Board (optional)</label>
                    <input {...register("board")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                    <E name="board" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class</label>
                    <input {...register("className")} placeholder="e.g., 10" className="mt-1 w-full rounded-lg border px-3 py-2" />
                    <E name="className" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Section (optional)</label>
                    <input {...register("section")} placeholder="e.g., A" className="mt-1 w-full rounded-lg border px-3 py-2" />
                    <E name="section" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Roll No</label>
                    <input {...register("rollNo")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                    <E name="rollNo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">DOB</label>
                    <input type="date" {...register("dob")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                    <E name="dob" />
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">College Name</label>
                    <input {...register("collegeName")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                    <E name="collegeName" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input {...register("department")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                    <E name="department" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year of Study</label>
                    <input type="number" {...register("yearOfStudy")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                    <E name="yearOfStudy" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Semester (optional)</label>
                    <input type="number" {...register("semester")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                    <E name="semester" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reg/Roll No</label>
                    <input {...register("regNo")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                    <E name="regNo" />
                  </div>
                </div>
              )}
            </>
          )}

          {roleType === RoleType.FACULTY && (
            <>
              {watch("institutionType") === InstitutionType.SCHOOL ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">School Name</label>
                    <input {...register("schoolName")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                    <E name="schoolName" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input {...register("subject")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                    <E name="subject" />
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">College Name</label>
                    <input {...register("collegeName")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                    <E name="collegeName" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input {...register("department")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                    <E name="department" />
                  </div>
                </div>
              )}
            </>
          )}

          {roleType === RoleType.PARENT && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Name (optional)</label>
                <input {...register("studentName")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                <E name="studentName" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Class (optional)</label>
                <input {...register("studentClass")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                <E name="studentClass" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Roll No (optional)</label>
                <input {...register("studentRollNo")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                <E name="studentRollNo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student DOB (optional)</label>
                <input type="date" {...register("studentDob")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                <E name="studentDob" />
              </div>
            </div>
          )}

          {roleType === RoleType.ADMIN && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Institution Name (optional)</label>
                <input {...register("institutionName")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                <E name="institutionName" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Designation (optional)</label>
                <input {...register("designation")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                <E name="designation" />
              </div>
              {watch("institutionType") === InstitutionType.COLLEGE && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department (optional)</label>
                  <input {...register("department")} className="mt-1 w-full rounded-lg border px-3 py-2" />
                  <E name="department" />
                </div>
              )}
            </div>
          )}

          {/* Passwords */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" {...register("password")} className="mt-1 w-full rounded-lg border px-3 py-2" />
              <E name="password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input type="password" {...register("confirmPassword")} className="mt-1 w-full rounded-lg border px-3 py-2" />
              <E name="confirmPassword" />
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
