'use client';
import React, { useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    // AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    // AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import {
    InputOTP,
    InputOTPGroup,
    // InputOTPSeparator,
    InputOTPSlot,
  } from "@/components/ui/input-otp"

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { setAdminSessionCookie } from '@/lib/auth-client';

const PasskeyModal = () => {
    const router = useRouter();
    const [open, setOpen] = useState(true);
    const [passkey, setPasskey] = useState('');
    const [error, setError] = useState('');

    const validatePasskey = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        if (passkey === process.env.NEXT_PUBLIC_ADMIN_PASSKEY) {
            setAdminSessionCookie();
            setOpen(false);
            router.replace('/admin');
            return;
        }

        setError('Invalid passkey. Please try again.')
    }

    const closeModal = () => {
        setOpen(false);
        router.replace('/');
    }

    return (
    <AlertDialog open={open} onOpenChange={setOpen}>
       
        <AlertDialogContent className="shad-alert-dialog w-[min(100%,calc(100vw-2rem))] max-w-[28rem] px-4 py-5 sm:px-6 sm:py-6">
            <AlertDialogHeader className="items-start">
              <div className="flex items-start justify-between gap-3">
                <AlertDialogTitle className="text-xl font-semibold leading-tight sm:text-2xl">
                  Admin Access Verification
                </AlertDialogTitle>
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dark-500 bg-dark-300 text-muted-foreground transition hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Close admin passkey modal"
                >
                  <Image
                    src="/assets/icons/close.svg"
                    alt="Close"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>
              </div>
              <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
                To access the admin page, please enter the passkey.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-col gap-4">
              <InputOTP maxLength={6} value={passkey} onChange={(value) => setPasskey(value)}>
                <InputOTPGroup className="shad-otp">
                  <InputOTPSlot className="shad-otp-slot" index={0} />
                  <InputOTPSlot className="shad-otp-slot" index={1} />
                  <InputOTPSlot className="shad-otp-slot" index={2} />
                  <InputOTPSlot className="shad-otp-slot" index={3} />
                  <InputOTPSlot className="shad-otp-slot" index={4} />
                  <InputOTPSlot className="shad-otp-slot" index={5} />
                </InputOTPGroup>
              </InputOTP>

              {error && (
                <p className="shad-error text-14-regular mt-2 text-center">
                  {error}
                </p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={(e) => validatePasskey(e)}
                className="shad-primary-btn w-full py-3 text-sm sm:text-base"
              >
                Enter Admin Passkey
              </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
</AlertDialog>

  )
}

export default PasskeyModal
