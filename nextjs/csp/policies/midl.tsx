import type CspDev from "csp-dev";

export function midl(): CspDev.DirectiveDescriptor {
  return {
    "connect-src": ["*.midl.xyz"],
  };
}
