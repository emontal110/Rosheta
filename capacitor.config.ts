import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.penrx.app",
  appName: "PenRx+",
  webDir: "public",
  server: {
    androidScheme: "https",
    url: "https://rosheta.vercel.app",
    cleartext: true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
