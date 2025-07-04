
import Image from "next/image";
import RegisterForm from "@/components/forms/RegisterForm";
import { getUser } from "@/lib/actions/patient.actions";
import BackToHomeButton from "@/components/BackToHomeButton";

// import * as Sentry from '@sentry/nextjs'


const Register = async ({ params }: { params: { userId: string } }) => {
  const { userId } = await params; // Await params before accessing its properties
  const user = await getUser(userId);
  
  // Sentry.metrics.set("user_view", user.name);

  return (
    <div className = "flex h-screen max-h-screen bg-white text-blue-700">

   <section className="remove-scrollbar container">
    <div className="w-full flex justify-end mt-4 pr-1">
        
  <Image
    src="/assets/icons/logo-clinic.jpg"
    height={150}
    width={150}
    alt="patient"
    style={{ height: '100px', width: '100px', objectFit: 'contain' }}
  />
</div>
   <BackToHomeButton />
    <div className="sub-container max-w-[860px] flex-1 flex-col py-10">
      
      

      
      <RegisterForm user={user}/>


      <p className="copyright py-12">
      © 2025 CLINIC PROFILING
      </p>
      
    </div>
   </section>

   <Image
    src="/assets/images/register-img.png"
    height={1000}
    width={1000}
    alt="patient"
    className="side-img max-w-[496px]"
   />
  </div>
  );
};

export default Register
