import Image from "next/image";
import RegisterForm from "@/components/forms/RegisterForm";
import { getUser } from "@/lib/actions/patient.actions";
import BackToHomeButton from "@/components/BackToHomeButton";


const Register = async ({ params }: { params: { userId: string } }) => {
  const { userId } = await params; // Await params before accessing its properties
  const user = await getUser(userId);
  



  return (
    <div className = "flex h-screen max-h-screen">
      
    {/* {TODO OTP} */}


   <section className="remove-scrollbar container">
   <BackToHomeButton />
   
    <div className="sub-container max-w-[860px] flex-1 flex-col py-10">
      
      {/* <Image
        src="/assets/icons/logo-full.svg"
        height={1000}
        width={1000}
        alt="patient"
        className="mb-12 h-10 w-fit"
      /> */}
      
      <RegisterForm user={user}/>


      <p className="copyright py-12">
      © 2025 OJT PROJECT
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
