export const diagonalFaceGeometry = {
  SE: {
    rightEye: [[522,165],[527,159],[533,156],[543,158],[552,161],[561,166],[569,174],[569,181],[562,189],[552,191],[543,187],[533,181],[526,174]],
    leftEye: [[594,173],[600,170],[607,170],[615,172],[619,177],[619,184],[614,195],[606,200],[599,194],[596,184]],
    rightBrow: [[530,142],[536,141],[544,144],[552,147],[561,151],[568,156],[568,159],[560,155],[552,152],[543,148],[535,145],[530,145]],
    leftBrow: [[595,159],[600,156],[607,155],[615,156],[616,159],[608,159],[601,160],[596,163]],
    mouth: [[558,211],[563,211],[568,215],[576,216],[581,214],[585,213],[585,217],[580,221],[573,222],[566,219],[560,215]],
  },
  SW: {
    rightEye: [[400,191],[405,187],[411,188],[419,191],[426,197],[430,204],[429,212],[423,218],[416,216],[408,211],[402,204],[399,199]],
    leftEye: [[439,182],[445,175],[453,171],[463,167],[475,163],[484,164],[489,167],[487,174],[480,184],[470,191],[459,196],[449,196],[442,190]],
    rightBrow: [[393,174],[399,173],[404,176],[409,180],[408,183],[402,180],[397,179],[393,177]],
    leftBrow: [[430,169],[434,163],[441,158],[449,154],[456,151],[461,151],[460,154],[453,158],[444,163],[436,169],[431,173]],
    mouth: [[432,233],[437,234],[445,232],[454,227],[458,225],[460,228],[453,234],[445,238],[438,239],[432,237]],
  },
} as const;

// Native lower-lid contour: discard the broad reference cheek tint beneath it.
// Four-by-four coverage changes alpha only; the eye RGB stays at native coordinates.
export const diagonalEyeCheekTrim = {
  direction: 'SE', feature: 'rightEye', coverageSamples: 4,
  polygon: [[520,150],[572,150],[572,176],[569,177],[566,179],[562,181],[558,182],[554,182],[550,182],[546,181.5],[542,180],[538,178],[534,176],[530,174],[526,171],[522,168],[520,166]],
} as const;

// Visible far-eye boundary excludes reference fringe and the downward outer strand.
// Preserve native iris/lash RGB; this does not author the eye concealed by the fringe.
export const diagonalFarEyeTrim = {
  direction: 'SE', feature: 'leftEye', coverageSamples: 4,
  polygon: [[598,170],[607,170],[611.5,170],[611.5,174],[613,176.5],[610.5,178.5],[608.5,180],[607.5,181.5],[606.5,183],[606.5,185],[605,187],[602.5,187],[601.5,185],[600.5,182],[598.5,179],[597,177],[596.5,174],[597,172]],
} as const;

// Restore only the removed same-facing fringe/strand pixels to foreground hair.
export const diagonalFarEyeHairOwnership = {
  direction: 'SE', feature: 'leftEye',
  outer: [[611.5,169],[620,169],[620,201],[603,201],[604,196],[604.5,192],[605.5,188],[606.5,185],[607.5,182],[609,180],[611,178],[613,176.5],[611.5,174]],
  inner: [[593,169],[598,169],[597,172],[596.5,174],[597,177],[598.5,179],[600.5,182],[601.5,185],[602.5,187],[598,187],[592,177]],
} as const;

// Revision 4 restores the visible lower-left iris/lid arc lost by the preceding trim.
export const diagonalFarEyeTrimV4 = {
  direction: 'SE', feature: 'leftEye', coverageSamples: 4,
  polygon: [[598,170],[607,170],[611.5,170],[611.5,174],[613,176.5],[610.5,178.5],[608.5,180],[607.5,181.5],[606.5,183],[606.5,185],[606,187],[603,189],[600,189],[597,188],[595.5,185.5],[595.5,182],[597.5,180],[597,177],[596.5,174],[597,172]],
} as const;

// Complete independently authored eye/lids, including geometry concealed by the fringe.
export const diagonalCompleteFarEye = {
  direction: 'SE', feature: 'leftEye', coverageSamples: 4,
  polygon: [[588,174],[592,169],[598,165],[605,163.5],[611,164],[615,166],[619,170],[621,171.5],[619,174],[614,175.5],[610,183.5],[608,187],[603,190],[596,190],[591,187],[587,183],[587,178]],
} as const;

// Local reference brow pigment only; the old polygon also copied a pale skin stripe.
// Intersect with the original selection, retaining native RGB and foreground hair.
export const diagonalRightBrowTrim = {
  direction: 'SE', feature: 'rightBrow', coverageSamples: 4,
  polygon: [[528,140],[538,140],[543,142.5],[545,144.5],[544,145.5],[541.5,146.5],[540,147],[536,145.5],[528,145.5]],
} as const;
