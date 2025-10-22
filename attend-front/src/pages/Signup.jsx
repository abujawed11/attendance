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
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

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

/* -------------------- validation functions -------------------- */
function validateBase(values, roleType) {
  const errors = {};

  if (!values.fullName || values.fullName.length < 2) {
    errors.fullName = "Enter your full name";
  }

  if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email";
  }

  if (!values.password || values.password.length < 8) {
    errors.password = "At least 8 characters";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(values.password)) {
    errors.password = "Include upper, lower & a number";
  }

  if (!values.confirmPassword || values.confirmPassword.length < 8) {
    errors.confirmPassword = "Confirm your password";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Invite code not required for parents
  if (roleType !== RoleType.PARENT) {
    if (!values.inviteCode || values.inviteCode.length < 3) {
      errors.inviteCode = "Invite code is required";
    }
  }

  return errors;
}

function validateStudentSchool(values) {
  const errors = {};

  if (!values.schoolName || values.schoolName.length < 2) {
    errors.schoolName = "Enter school name";
  }

  if (!values.phone || values.phone.length < 10) {
    errors.phone = "Enter valid phone number";
  }

  if (!values.board || values.board.length < 2) {
    errors.board = "Enter board";
  }

  if (!values.className || values.className.length < 1) {
    errors.className = "Enter class";
  }

  if (!values.section || values.section.length < 1) {
    errors.section = "Enter section";
  }

  if (!values.rollNo || values.rollNo.length < 1) {
    errors.rollNo = "Enter roll no";
  }

  if (!values.dob || values.dob.length < 1) {
    errors.dob = "Select DOB";
  }

  return errors;
}

function validateStudentCollege(values) {
  const errors = {};

  if (!values.collegeName || values.collegeName.length < 2) {
    errors.collegeName = "Enter college name";
  }

  if (!values.phone || values.phone.length < 10) {
    errors.phone = "Enter valid phone number";
  }

  if (!values.department || values.department.length < 2) {
    errors.department = "Enter department";
  }

  if (!values.yearOfStudy || values.yearOfStudy < 1 || values.yearOfStudy > 8) {
    errors.yearOfStudy = "Enter valid year (1-8)";
  }

  if (!values.semester || values.semester < 1 || values.semester > 16) {
    errors.semester = "Enter valid semester";
  }

  if (!values.regNo || values.regNo.length < 1) {
    errors.regNo = "Enter registration/roll no";
  }

  return errors;
}

function validateFacultySchool(values) {
  const errors = {};

  if (!values.schoolName || values.schoolName.length < 2) {
    errors.schoolName = "Enter school name";
  }

  if (!values.phone || values.phone.length < 10) {
    errors.phone = "Enter valid phone number";
  }

  if (!values.department || values.department.length < 2) {
    errors.department = "Select department";
  }

  if (!values.employeeId || values.employeeId.length < 1) {
    errors.employeeId = "Enter employee ID";
  }

  return errors;
}

function validateFacultyCollege(values) {
  const errors = {};

  if (!values.collegeName || values.collegeName.length < 2) {
    errors.collegeName = "Enter college name";
  }

  if (!values.phone || values.phone.length < 10) {
    errors.phone = "Enter valid phone number";
  }

  if (!values.department || values.department.length < 2) {
    errors.department = "Select department";
  }

  if (!values.designation || values.designation.length < 2) {
    errors.designation = "Select designation";
  }

  if (!values.employeeId || values.employeeId.length < 1) {
    errors.employeeId = "Enter employee ID";
  }

  return errors;
}

function validateForm(values, roleType, institutionType) {
  let errors = validateBase(values, roleType);

  if (roleType === RoleType.STUDENT) {
    if (institutionType === InstitutionType.SCHOOL) {
      errors = { ...errors, ...validateStudentSchool(values) };
    } else {
      errors = { ...errors, ...validateStudentCollege(values) };
    }
  } else if (roleType === RoleType.FACULTY) {
    if (institutionType === InstitutionType.SCHOOL) {
      errors = { ...errors, ...validateFacultySchool(values) };
    } else {
      errors = { ...errors, ...validateFacultyCollege(values) };
    }
  }

  return errors;
}

/* -------------------- helper: build API payload -------------------- */
function buildPayload(values) {
  const {
    fullName, email, password, roleType, inviteCode, phone,
    institutionType,
    schoolName, board, className, section, rollNo, dob,
    collegeName, department, yearOfStudy, semester, regNo,
    subject, employeeId,
    studentName, studentClass, studentRollNo, studentDob,
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
          dob,
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
        data: {
          schoolName,
          department,
          employeeId,
        },
      };
    } else {
      payload.profile = {
        kind: "facultyCollege",
        data: {
          collegeName,
          department,
          designation,
          employeeId,
        },
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
  const navigate = useNavigate();
  const [roleType, setRoleType] = useState(RoleType.STUDENT);
  const [institutionType, setInstitutionType] = useState(InstitutionType.SCHOOL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // OTP verification state
  const [step, setStep] = useState(1); // 1: signup form, 2: OTP verification
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [signupPayload, setSignupPayload] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleType: RoleType.STUDENT,
    inviteCode: "",
    phone: "",
    institutionType: InstitutionType.SCHOOL,
    schoolName: "",
    board: "",
    className: "",
    section: "",
    rollNo: "",
    dob: "",
    collegeName: "",
    department: "",
    yearOfStudy: "",
    semester: "",
    regNo: "",
    subject: "",
    employeeId: "",
    designation: "",
    studentName: "",
    studentClass: "",
    studentRollNo: "",
    studentDob: "",
    institutionName: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const onChangeRole = (e) => {
    const rt = e.target.value;
    setRoleType(rt);
    setFormData(prev => ({ ...prev, roleType: rt }));
  };

  const onChangeInst = (e) => {
    const it = e.target.value;
    setInstitutionType(it);
    
    // Clear institution-specific fields when switching
    setFormData(prev => ({
      ...prev,
      institutionType: it,
      schoolName: "",
      collegeName: "",
      department: "",
      subject: "",
      board: "",
      className: "",
      section: "",
      rollNo: "",
      dob: "",
      yearOfStudy: "",
      semester: "",
      regNo: "",
    }));
    
    // Clear related errors
    setErrors({});
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(formData, roleType, institutionType);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload(formData);
      console.log("Signup payload →", payload);

      // Call backend API to send OTP
      const res = await fetch(API_ENDPOINTS.SIGNUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrors({ submit: data.message || "Failed to send OTP" });
        alert(data.message || "Failed to send OTP");
        return;
      }

      // OTP sent successfully
      setSignupPayload(payload);
      setOtpSent(true);
      setStep(2);
      alert(`OTP sent to ${formData.email}. Please check your email.`);
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({ submit: "Failed to connect to server" });
      alert("Failed to connect to server. Make sure the backend is running on port 5000.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setErrors({ otp: "Please enter 6-digit OTP" });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(API_ENDPOINTS.VERIFY_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp,
          ...signupPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrors({ otp: data.message || "Invalid OTP" });
        alert(data.message || "Invalid OTP");
        return;
      }

      // Account created successfully
      alert("Account created successfully! Please login with your credentials.");
      console.log("User created:", data.data.user);
      console.log("JWT Token:", data.data.token);

      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error("OTP verification error:", error);
      setErrors({ otp: "Failed to verify OTP" });
      alert("Failed to verify OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResendOTP = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetch(API_ENDPOINTS.RESEND_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to resend OTP");
        return;
      }

      alert("OTP resent to your email");
      setOtp("");
    } catch (error) {
      console.error("Resend OTP error:", error);
      alert("Failed to resend OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const E = ({ name }) => errors?.[name] && (
    <p className="text-sm text-red-600 mt-1">{errors[name]}</p>
  );

  // OTP Verification Step
  if (step === 2) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-semibold text-center mb-2">Verify Your Email</h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            We've sent a 6-digit OTP to <strong>{formData.email}</strong>
          </p>

          <form onSubmit={onVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setErrors({});
                }}
                placeholder="123456"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-indigo-500"
              />
              <E name="otp" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={onResendOTP}
                disabled={isSubmitting}
                className="text-sm text-indigo-600 hover:underline disabled:opacity-60"
              >
                Resend OTP
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-600 hover:underline"
              >
                Back to signup form
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Signup Form (Step 1)
  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold text-center mb-2">Create your account</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Sign up with role-specific details</p>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Role */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">I am a</label>
              <select
                name="roleType"
                value={roleType}
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

            {(roleType === RoleType.STUDENT || roleType === RoleType.FACULTY || roleType === RoleType.ADMIN) && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Institution Type</label>
                <select
                  name="institutionType"
                  value={institutionType}
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
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
              <E name="fullName" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
              <E name="email" />
            </div>
          </div>

          {/* Invite - not required for parents */}
          {roleType !== RoleType.PARENT && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Invite Code</label>
              <input
                name="inviteCode"
                value={formData.inviteCode}
                onChange={handleChange}
                placeholder="e.g., ABC123"
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
              <E name="inviteCode" />
            </div>
          )}

          {/* Phone - only show in general section if NOT Student or Faculty (they have it in role-specific section) */}
          {!(roleType === RoleType.STUDENT || roleType === RoleType.FACULTY) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
              <E name="phone" />
            </div>
          )}

          {/* ===================== Role-specific fields ===================== */}
          {roleType === RoleType.STUDENT && (
            <>
              {institutionType === InstitutionType.SCHOOL ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">School Name</label>
                    <input
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="schoolName" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit phone number"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="phone" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Board</label>
                    <input
                      name="board"
                      value={formData.board}
                      onChange={handleChange}
                      placeholder="e.g., CBSE, ICSE, State Board"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="board" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class</label>
                    <input
                      name="className"
                      value={formData.className}
                      onChange={handleChange}
                      placeholder="e.g., 10"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="className" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Section</label>
                    <input
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                      placeholder="e.g., A"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="section" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Roll No</label>
                    <input
                      name="rollNo"
                      value={formData.rollNo}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="rollNo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">DOB</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="dob" />
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">College Name</label>
                    <input
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="collegeName" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit phone number"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="phone" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science Engineering">Computer Science Engineering (CSE)</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Electronics and Communication">Electronics and Communication</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Business Administration">Business Administration (BBA)</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Arts">Arts</option>
                      <option value="Science">Science</option>
                    </select>
                    <E name="department" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year of Study</label>
                    <input
                      type="number"
                      name="yearOfStudy"
                      value={formData.yearOfStudy}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="yearOfStudy" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Semester</label>
                    <input
                      type="number"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="semester" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reg/Roll No</label>
                    <input
                      name="regNo"
                      value={formData.regNo}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="regNo" />
                  </div>
                </div>
              )}
            </>
          )}

          {roleType === RoleType.FACULTY && (
            <>
              {institutionType === InstitutionType.SCHOOL ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">School Name</label>
                    <input
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="schoolName" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit phone number"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="phone" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Department</option>
                      <option value="English">English</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Biology">Biology</option>
                      <option value="History">History</option>
                      <option value="Geography">Geography</option>
                      <option value="Economics">Economics</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Physical Education">Physical Education</option>
                    </select>
                    <E name="department" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                    <input
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="employeeId" />
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">College Name</label>
                    <input
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="collegeName" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit phone number"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="phone" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science Engineering">Computer Science Engineering (CSE)</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Electronics and Communication">Electronics and Communication</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Business Administration">Business Administration (BBA)</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Arts">Arts</option>
                      <option value="Science">Science</option>
                    </select>
                    <E name="department" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Designation</label>
                    <select
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Designation</option>
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Lecturer">Lecturer</option>
                      <option value="Senior Lecturer">Senior Lecturer</option>
                      <option value="Guest Lecturer">Guest Lecturer</option>
                      <option value="Teaching Assistant">Teaching Assistant</option>
                    </select>
                    <E name="designation" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                    <input
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    <E name="employeeId" />
                  </div>
                </div>
              )}
            </>
          )}

          {roleType === RoleType.PARENT && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Name (optional)</label>
                <input
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
                <E name="studentName" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Class (optional)</label>
                <input
                  name="studentClass"
                  value={formData.studentClass}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
                <E name="studentClass" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Roll No (optional)</label>
                <input
                  name="studentRollNo"
                  value={formData.studentRollNo}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
                <E name="studentRollNo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student DOB (optional)</label>
                <input
                  type="date"
                  name="studentDob"
                  value={formData.studentDob}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
                <E name="studentDob" />
              </div>
            </div>
          )}

          {roleType === RoleType.ADMIN && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Institution Name (optional)</label>
                <input
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
                <E name="institutionName" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Designation (optional)</label>
                <input
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
                <E name="designation" />
              </div>
              {institutionType === InstitutionType.COLLEGE && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department (optional)</label>
                  <input
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                  />
                  <E name="department" />
                </div>
              )}
            </div>
          )}

          {/* Passwords */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
              <E name="password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
              <E name="confirmPassword" />
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            {isSubmitting ? "Sending OTP..." : "Send OTP"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-600 font-medium hover:underline">
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}