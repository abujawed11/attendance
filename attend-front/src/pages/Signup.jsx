import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/**
 * 🔒 Replace with real API later:
 *   POST /invites/verify { inviteCode } -> { tenantName, allowedRoles, allowedDomains }
 */
async function verifyInvite(inviteCode) {
  const MOCK = {
    // invite → allowed roles + email domains
    ABC123: {
      tenantName: "Springfield College",
      roles: ["student", "faculty"],
      domains: ["spring.edu"],
    },
    ADMIN42: {
      tenantName: "Springfield College",
      roles: ["admin"],
      domains: ["spring.edu"],
    },
    XYZ999: {
      tenantName: "TechVille Institute",
      roles: ["student", "faculty", "admin"],
      domains: ["techville.ac.in"],
    },
  };
  const rec = MOCK[(inviteCode || "").trim()];
  await new Promise((r) => setTimeout(r, 250)); // simulate latency
  if (!rec) return { ok: false, message: "Invalid or expired invite code." };
  return {
    ok: true,
    tenantName: rec.tenantName,
    allowedRoles: rec.roles,
    allowedDomains: rec.domains,
  };
}

/* -------------------------- Validation -------------------------- */

const passwordRules =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,}$/;

const SignupSchema = z
  .object({
    inviteCode: z.string().min(3, "Invite code is required"),
    role: z.enum(["student", "faculty", "admin"], {
      required_error: "Select a role",
    }),
    fullName: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(passwordRules, "Include upper, lower & a number"),
    confirmPassword: z.string().min(8, "Confirm your password"),
    tos: z.literal(true, {
      errorMap: () => ({ message: "You must accept Terms & Privacy" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export default function Signup() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(SignupSchema),
    mode: "onChange",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [inviteInfo, setInviteInfo] = useState({
    status: "idle", // idle | checking | ok | error
    tenantName: undefined,
    allowedRoles: undefined,
    allowedDomains: undefined,
    message: undefined,
  });

  const inviteCode = watch("inviteCode");
  const selectedRole = watch("role");
  const email = watch("email");

  // verify invite on the fly
  useEffect(() => {
    if (!inviteCode || inviteCode.trim().length < 3) {
      setInviteInfo({ status: "idle" });
      return;
    }
    let cancelled = false;
    (async () => {
      setInviteInfo({ status: "checking" });
      const res = await verifyInvite(inviteCode);
      if (cancelled) return;
      if (res.ok)
        setInviteInfo({
          status: "ok",
          tenantName: res.tenantName,
          allowedRoles: res.allowedRoles,
          allowedDomains: res.allowedDomains,
        });
      else setInviteInfo({ status: "error", message: res.message });
    })();
    return () => {
      cancelled = true;
    };
  }, [inviteCode]);

  // derive email domain
  const emailDomain = useMemo(() => {
    const v = (email || "").trim().toLowerCase();
    const at = v.lastIndexOf("@");
    return at > -1 ? v.slice(at + 1) : "";
  }, [email]);

  const onSubmit = async (data) => {
    if (inviteInfo.status !== "ok") {
      setError("inviteCode", {
        type: "manual",
        message: inviteInfo.message || "Invalid invite code",
      });
      return;
    }
    const { allowedDomains = [], allowedRoles = [] } = inviteInfo;

    // role must be allowed by invite
    if (!allowedRoles.includes(data.role)) {
      setError("role", {
        type: "manual",
        message: `Role not allowed by this invite. Allowed: ${allowedRoles.join(
          ", "
        )}`,
      });
      return;
    }

    // email domain must match
    if (
      !emailDomain ||
      !allowedDomains.some((d) => emailDomain === d.toLowerCase())
    ) {
      setError("email", {
        type: "manual",
        message: `Use your institute email (${allowedDomains.join(" / ")})`,
      });
      return;
    }

    clearErrors();

    // 🔗 Replace with real API:
    // await api.post('/auth/signup', { ...data, inviteCode: data.inviteCode })
    console.log("SIGNUP OK → send to API:", {
      inviteCode: data.inviteCode,
      role: data.role,
      fullName: data.fullName,
      email: data.email,
      password: "[REDACTED]",
    });

    alert("Signup successful (mock). Next: wire /auth/signup API.");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 grid place-items-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        {/* Brand */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-gray-500">
            Join your institute’s workspace
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Invite Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Invite Code
            </label>
            <input
              {...register("inviteCode")}
              placeholder="e.g., ABC123"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.inviteCode && (
              <p className="text-sm text-red-600 mt-1">
                {errors.inviteCode.message}
              </p>
            )}

            {/* Invite status */}
            {inviteInfo.status === "checking" && (
              <p className="text-xs text-gray-500 mt-1">Validating invite…</p>
            )}
            {inviteInfo.status === "ok" && (
              <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
                <div>
                  <span className="font-medium">Institute:</span>{" "}
                  {inviteInfo.tenantName}
                </div>
                <div>
                  <span className="font-medium">Allowed roles:</span>{" "}
                  {inviteInfo.allowedRoles?.join(", ")}
                </div>
                <div>
                  <span className="font-medium">Email domain:</span>{" "}
                  {inviteInfo.allowedDomains?.join(" / ")}
                </div>
              </div>
            )}
            {inviteInfo.status === "error" && (
              <p className="text-xs text-red-600 mt-1">{inviteInfo.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              I am a
            </label>
            <select
              {...register("role")}
              defaultValue="student"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
            )}
            {inviteInfo.status === "ok" &&
              inviteInfo.allowedRoles &&
              selectedRole &&
              !inviteInfo.allowedRoles.includes(selectedRole) && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
                  This invite doesn’t allow “{selectedRole}”. Allowed:{" "}
                  {inviteInfo.allowedRoles.join(", ")}.
                </p>
              )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              {...register("fullName")}
              placeholder="Your full name"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.fullName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Institute Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="you@institute.edu"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
            {inviteInfo.status === "ok" &&
              inviteInfo.allowedDomains?.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Must be: {inviteInfo.allowedDomains.join(" / ")}
                  {emailDomain && ` • You entered: ${emailDomain}`}
                </p>
              )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Min 8 chars, include upper, lower & a number.
            </p>
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input type="checkbox" {...register("tos")} className="mt-1" />
            <span>
              I agree to the{" "}
              <a className="text-indigo-600 underline" href="#">
                Terms
              </a>{" "}
              &{" "}
              <a className="text-indigo-600 underline" href="#">
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {errors.tos && (
            <p className="text-sm text-red-600">{errors.tos.message}</p>
          )}

          {/* Submit */}
          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
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
