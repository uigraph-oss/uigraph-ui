'use client'
import forgotPasswordIcon from '@/assets/icons/forgot-password.svg'
import { SettingsHeader } from './components/settings-header'

export function SecuritySettings() {
  return (
    <>
      <SettingsHeader
        title="Security"
        description="Set up security measure for better protection"
      />

      <div className="space-y-6 p-6">
        <div className="rounded-lg border border-[#2A3242] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-1 text-[16px] font-medium text-[#828DA3]">
                Password
              </h3>
              <p className="text-[#828DA3]">Last updated 3 months ago</p>
            </div>
            <button className="font-sm flex h-[44px] items-center gap-1 rounded-[12px] bg-[#2A3242] px-3 leading-[1.33] font-normal">
              <img
                className="size-[16px]"
                src={forgotPasswordIcon}
                alt="arrow-up-right"
              />{' '}
              Change Password
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
