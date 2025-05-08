import { defineStore } from 'pinia';

export const useOnboardingStore = defineStore('onboarding', {
  state: () => ({
    currentStep: null,
  }),
  actions: {
    setStep(step) {
      this.currentStep = step;
    },
    resetStep() {
      this.currentStep = null;
    },
  },
});