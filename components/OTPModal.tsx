'use client';

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Image from 'next/image';

interface OTPModalProps {
  email: string;
  otp: string;
  onClose: () => void;
  onVerify: (enteredOtp: string) => Promise<void>;
}

const OTPModal: React.FC<OTPModalProps> = ({ email, otp, onClose, onVerify }) => {
  const [inputOtp, setInputOtp] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    try {
      await onVerify(inputOtp); // Call the parent-provided verification function
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    }
  };

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-start justify-between">
            OTP Verification
            <Image
              src="/assets/icons/close.svg"
              alt="close"
              width={20}
              height={20}
              onClick={onClose}
              className="cursor-pointer"
            />
          </AlertDialogTitle>
          <AlertDialogDescription>
            Enter the 6-digit OTP sent to <span className="font-medium">{email}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div>
          <InputOTP maxLength={6} value={inputOtp} onChange={setInputOtp}>
            <InputOTPGroup className="shad-otp">
              {[...Array(6)].map((_, index) => (
                <InputOTPSlot className="shad-otp-slot" key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <p className="shad-error text-14-regular mt-4 flex justify-center">
              {error}
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <button
            onClick={handleVerify}
            className="w-full py-3 text-lg font-semibold bg-green-500 text-white rounded-lg transform transition-transform active:scale-95"
          >
            Verify OTP
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OTPModal;
