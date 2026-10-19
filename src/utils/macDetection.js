/**
 * Real MAC Address Detection Utility
 * Tries multiple methods to detect MAC address
 */

// Method 1: Using Node.js (if running in Electron/Desktop app)
export const getMacWithNode = async () => {
  try {
    // Check if running in Node.js environment
    if (window.require) {
      const { exec } = window.require("child_process");

      return new Promise((resolve) => {
        // For Windows
        if (window.navigator.platform.toLowerCase().includes("win")) {
          exec("getmac /fo csv /nh", (error, stdout) => {
            if (error) {
              console.error("getmac error:", error);
              resolve(null);
              return;
            }

            try {
              // Parse CSV output
              const lines = stdout.split("\n").filter((line) => line.trim());
              const macs = [];

              for (const line of lines) {
                const parts = line
                  .split(",")
                  .map((p) => p.replace(/"/g, "").trim());
                if (parts.length >= 2) {
                  const mac = parts[0].replace(/-/g, ":");
                  // Skip media disconnected
                  if (!parts[1]?.includes("disconnected")) {
                    macs.push({
                      mac: mac.toUpperCase(),
                      transport: parts[1],
                      isActive: true,
                    });
                  }
                }
              }

              // Return first active MAC or first MAC
              const activeMac = macs.find((m) => m.isActive);
              resolve(activeMac?.mac || macs[0]?.mac || null);
            } catch (parseError) {
              console.error("Parse error:", parseError);
              resolve(null);
            }
          });
        } else {
          // For Linux/Mac
          const command = window.navigator.platform
            .toLowerCase()
            .includes("mac")
            ? "ifconfig | grep ether | awk '{print $2}'"
            : "ip link show | grep ether | awk '{print $2}'";

          exec(command, (error, stdout) => {
            if (error) {
              resolve(null);
              return;
            }

            const macs = stdout.split("\n").filter((line) => line.trim());
            resolve(macs[0]?.toUpperCase() || null);
          });
        }
      });
    }
    return null;
  } catch (error) {
    console.error("Node MAC detection error:", error);
    return null;
  }
};

// Method 2: Using ActiveX (Windows + Internet Explorer only)
const getMacWithActiveX = () => {
  try {
    // @ts-ignore
    const wmi = new ActiveXObject("WbemScripting.SWbemLocator");
    // @ts-ignore
    const service = wmi.ConnectServer(".", "root\\cimv2");
    const items = service.ExecQuery(
      "SELECT * FROM Win32_NetworkAdapterConfiguration WHERE IPEnabled=True",
    );
    const enumerator = new Enumerator(items);

    for (; !enumerator.atEnd(); enumerator.moveNext()) {
      const item = enumerator.item();
      if (item.MACAddress && item.IPEnabled) {
        return item.MACAddress.replace(/-/g, ":").toUpperCase();
      }
    }
    return null;
  } catch (error) {
    console.log("ActiveX not available:", error);
    return null;
  }
};

// Method 3: Using browser fingerprint (fallback)
export const getBrowserFingerprint = () => {
  try {
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 0,
      navigator.deviceMemory || 0,
    ];

    const fingerprint = components.join("|");
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    // Convert to MAC-like format
    const mac = Math.abs(hash).toString(16).padStart(12, "0").toUpperCase();
    return mac.match(/.{1,2}/g).join(":");
  } catch (error) {
    console.error("Fingerprint error:", error);
    return null;
  }
};

// Main detection function
export const detectMacAddress = async () => {
  console.log("🔍 Detecting MAC Address...");

  // Method 1: Try Node.js
  const nodeMac = await getMacWithNode();
  if (nodeMac) {
    console.log("✅ MAC detected via Node:", nodeMac);
    return nodeMac;
  }

  // Method 2: Try ActiveX
  const activeXMac = getMacWithActiveX();
  if (activeXMac) {
    console.log("✅ MAC detected via ActiveX:", activeXMac);
    return activeXMac;
  }

  // Method 3: Fallback to fingerprint
  const fingerprint = getBrowserFingerprint();
  if (fingerprint) {
    console.log("⚠️ Using fingerprint as fallback:", fingerprint);
    return fingerprint;
  }

  console.warn("⚠️ Could not detect MAC address");
  return null;
};

// Helper: Validate MAC format
export const validateMacAddress = (mac) => {
  if (!mac) return false;
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
};

// Helper: Format MAC
export const formatMacAddress = (mac) => {
  if (!mac) return "";
  const cleaned = mac.replace(/[^0-9A-Fa-f]/g, "");
  if (cleaned.length !== 12) return mac;
  return cleaned
    .match(/.{1,2}/g)
    .join(":")
    .toUpperCase();
};
