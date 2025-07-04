import PatientForms from "@/components/forms/PatientForms"
import PasskeyModal from "@/components/PasskeyModal";
import { ThemeProvider } from "@/components/theme-provider";
import Image from "next/image"
import Link from "next/link"

export default async function Home({ searchParams}: SearchParamProps) {
  const params = await searchParams;
  const isAdmin = params.admin === 'true';
 return (
  <div className = "flex h-screen max-h-screen bg-white text-blue-700">
    {isAdmin && <PasskeyModal/>}


   <section className="remove-scrollbar container my-auto bg-white">
  {/* Logo container - separate from sub-container */}
  <div className="w-full">
    <div className="ml-12 mt-4">
      <Image
        src="/assets/icons/logo-clinic.jpg"
        height={150}
        width={150}
        alt="patient"
         style={{ height: '150px', width: '150px', objectFit: 'contain' }}
        
      />
    </div>
  </div>

  {/* Main content */}
  <div className="sub-container max-w-[496px]">
    <PatientForms />
    <div className="text-14-regular mt-20 flex justify-between">
      <p className="justify-items-end text-dark-600 xl:text-left">
        © 2025 CLINIC PROFILING
      </p>
      <Link href="/?admin=true" className="text-green-500">
        Admin
      </Link>
    </div>
  </div>
</section>

   <Image
    src="/assets/images/onboarding-img.png"
    height={1000}
    width={1000}
    alt="patient"
    className="side-img max-w-[50%]"
   />
  </div>
 )
}
