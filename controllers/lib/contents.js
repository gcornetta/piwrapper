var i18n = require('i18n')

var regFormText = {
  title: i18n.__('w_00001'),
  headerTitle: i18n.__('w_00002'),
  headerSubtitle: i18n.__('w_00003'),
  bodyTitle_1: i18n.__('w_00004'),
  bodyTitle_2: i18n.__('w_00005'),
  bodyTitle_3: i18n.__('w_00006'),
  bodyDescrip_1: i18n.__('w_00007'),
  bodyDescrip_2: i18n.__('w_00008'),
  bodyDescrip_3: i18n.__('w_00009'),
  namePlaceholderText: i18n.__('w_00010'),
  surnamePlaceholderText: i18n.__('w_00011'),
  emailPlaceholderText: i18n.__('w_00012'),
  userNamePlaceholderText: i18n.__('w_00013'),
  passwordPlaceholderText: i18n.__('w_00014'),
  passConfirmPlaceholderText: i18n.__('w_00015'),
  submitButtonText: i18n.__('w_00016'),
  loginButtonText: i18n.__('w_00017')
}

exports.regFormText = regFormText

var loginFormText = {
  title: i18n.__('w_00001'),
  homePageLink: i18n.__('w_00018'),
  loginHeader: i18n.__('w_00019'),
  userPlaceholder: {label: i18n.__('w_00020'), text: i18n.__('w_00021')},
  passwordPlaceholder: {label: i18n.__('w_00022'), text: i18n.__('w_00022')},
  submitButtonText: i18n.__('w_00023'),
  forgotPasswordLink: i18n.__('w_00024'),
  forgotPasswordTooltip: i18n.__('w_00025'),
  gobackTologinTooltip: i18n.__('w_00026'),
  requestFormHeaderText: i18n.__('w_00027'),
  passwordRequestButton: i18n.__('w_00028')
}

exports.loginFormText = loginFormText

var dashboardText = {
  title: i18n.__('w_00001'),
  headerTitle: i18n.__('w_00002'),
  headerSubtitle: i18n.__('w_00029'),
  fabLabName: i18n.__('w_00002'),
  fabLabText: i18n.__('w_00030'),
  sideBar: {user: {editProfile: i18n.__('w_00031'), settings: i18n.__('w_00032')},
    wizard: i18n.__('w_00033'),
    machine: i18n.__('w_00104'),
    system: {title: i18n.__('w_00034'), overview: i18n.__('w_00035'), stats: i18n.__('w_00036')},
    tools: {title: i18n.__('w_00037'), userManag: i18n.__('w_00038'), sysMonit: i18n.__('w_00039'), sysLog: i18n.__('w_00040')},
    workload: i18n.__('w_00041'),
    jobs: i18n.__('w_00256')
  },
  terminalPanelTitle: i18n.__('w_00042'),
  cpuPanelTitle: i18n.__('w_00043'),
  cpuUptime: i18n.__('w_00044')
}

exports.dashboardText = dashboardText

var profileText = {
  editProfile: i18n.__('w_00045'),
  userName: i18n.__('w_00046'),
  role: i18n.__('w_00047'),
  email: i18n.__('w_00048'),
  firstName: i18n.__('w_00049'),
  lastName: i18n.__('w_00050'),
  updateProfile: i18n.__('w_00051'),
  uploadPhoto: i18n.__('w_00052')
}

exports.profileText = profileText

var sysInfoText = {
  parameter: i18n.__('w_00070'),
  value: i18n.__('w_00071'),
  arch: i18n.__('w_00072'),
  numCores: i18n.__('w_00073'),
  clk: i18n.__('w_00074'),
  avgClk: i18n.__('w_00075'),
  osType: i18n.__('w_00076'),
  release: i18n.__('w_00077'),
  totMem: i18n.__('w_00078'),
  freeMem: i18n.__('w_00079'),
  avgLoad: i18n.__('w_00080'),
  coreLabel: i18n.__('w_00081'),
  timeWin1: i18n.__('w_00082'),
  timeWin2: i18n.__('w_00083'),
  timeWin3: i18n.__('w_00084')
}

exports.sysInfoText = sysInfoText

var panelNames = {
  dashboard: i18n.__('w_00087'),
  profile: i18n.__('w_00088'),
  wizard: i18n.__('w_00094'),
  settings: i18n.__('w_00105'),
  logs: i18n.__('w_00115'),
  control: i18n.__('w_00145'),
  jobs: i18n.__('w_00249'),
  monitor: i18n.__('w_00263')
}

exports.panelNames = panelNames

var userRoles = {
  superAdmin: i18n.__('w_00089'),
  admin: i18n.__('w_00090')
}

exports.userRoles = userRoles

var settingsText = {
  editSettings: i18n.__('w_00106'),
  machineName: i18n.__('w_00107'),
  machineType: i18n.__('w_00108'),
  machineVendor: i18n.__('w_00109'),
  machineThreshCurr: i18n.__('w_00258'),
  machineSampleTime: i18n.__('w_00259'),
  machineDutyCycle: i18n.__('w_00260'),
  adcVendor: i18n.__('w_00110'),
  adcDevice: i18n.__('w_00111'),
  updateSettings: i18n.__('w_00112'),
  deviceUri: i18n.__('w_00254'),
  refresh: i18n.__('w_00255'),
  baudRate: i18n.__('w_00264'),
  defaultApiParams: i18n.__('w_00265')
}

exports.settingsText = settingsText

var jobsTableText = {
  search: i18n.__('w_00242'),
  priority: i18n.__('w_00243'),
  userId: i18n.__('w_00244'),
  process: i18n.__('w_00245'),
  jobPath: i18n.__('w_00246'),
  status: i18n.__('w_00247'),
  actions: i18n.__('w_00248'),
  jobsTable: i18n.__('w_00249'),
  caller: i18n.__('w_00257'),
  material: i18n.__('w_00266')
}

exports.jobsTableText = jobsTableText

var laserPanelText = {
  epilog: { switches: {title: i18n.__('w_00116'), autofocus: i18n.__('w_00117'), sort: i18n.__('w_00118'), fill: i18n.__('w_00168')},
    select: {process: {title: i18n.__('w_00124'), cut: i18n.__('w_00125'), halftone: i18n.__('w_00126')}, material: {title: i18n.__('w_00127'), cardboard: i18n.__('w_00128'), acrylic: i18n.__('w_00129'), wood: i18n.__('w_00130'), mylar: i18n.__('w_00131')}},
    position: {title: i18n.__('w_00119'), topleft: i18n.__('w_00120'), topright: i18n.__('w_00121'), bottomleft: i18n.__('w_00122'), bottomright: i18n.__('w_00123')},
    engine: {title: i18n.__('w_00132'), power: i18n.__('w_00133'), speed: i18n.__('w_00134'), rate: i18n.__('w_00135')},
    cut: {title: i18n.__('w_00136'), diameter: i18n.__('w_00137'), offsets: i18n.__('w_00138'), overlap: i18n.__('w_00139'), error: i18n.__('w_00140'), threshold: i18n.__('w_00141'), merge: i18n.__('w_00142'), order: i18n.__('w_00143'), sequence: i18n.__('w_00144')},
    halftone: {title: i18n.__('w_00136'), diameter: i18n.__('w_00137'), spotSize: i18n.__('w_00163'), minSpotsize: i18n.__('w_00164'), horSpotspace: i18n.__('w_00165'), verSpotspace: i18n.__('w_00166'), pointSpot: i18n.__('w_00167')}
  },
  trotec: { switches: {title: i18n.__('w_00177'), sort: i18n.__('w_00178'), fill: i18n.__('w_00179')},
    select: {process: {title: i18n.__('w_00124'), cut: i18n.__('w_00125'), halftone: i18n.__('w_00126')}, material: {title: i18n.__('w_00127'), cardboard: i18n.__('w_00128'), acrylic: i18n.__('w_00129'), wood: i18n.__('w_00130'), mylar: i18n.__('w_00131')}, machine: {title: i18n.__('w_00172'), speedy100: i18n.__('w_00173'), speedy100FlexxCO2: i18n.__('w_00174'), speedy100FlexxFiber: i18n.__('w_00175'), speedy400: i18n.__('w_00176')}},
    position: {title: i18n.__('w_00119'), topleft: i18n.__('w_00120'), topright: i18n.__('w_00121'), bottomleft: i18n.__('w_00122'), bottomright: i18n.__('w_00123')},
    engine: {title: i18n.__('w_00132'), power: i18n.__('w_00169'), velocity: i18n.__('w_00170'), frequency: i18n.__('w_00171')},
    cut: {title: i18n.__('w_00136'), diameter: i18n.__('w_00137'), offsets: i18n.__('w_00138'), overlap: i18n.__('w_00139'), error: i18n.__('w_00140'), threshold: i18n.__('w_00141'), merge: i18n.__('w_00142'), order: i18n.__('w_00143'), sequence: i18n.__('w_00144')},
    halftone: {title: i18n.__('w_00136'), diameter: i18n.__('w_00137'), spotSize: i18n.__('w_00163'), minSpotsize: i18n.__('w_00164'), horSpotspace: i18n.__('w_00165'), verSpotspace: i18n.__('w_00166'), pointSpot: i18n.__('w_00167')}
  },
  gcc: { switches: {title: i18n.__('w_00116'), autofocus: i18n.__('w_00117'), sort: i18n.__('w_00118'), fill: i18n.__('w_00168')},
    select: {process: {title: i18n.__('w_00124'), cut: i18n.__('w_00125'), halftone: i18n.__('w_00126')}, material: {title: i18n.__('w_00127'), cardboard: i18n.__('w_00128'), acrylic: i18n.__('w_00129'), wood: i18n.__('w_00130'), mylar: i18n.__('w_00131')}},
    position: {title: i18n.__('w_00119'), topleft: i18n.__('w_00120'), topright: i18n.__('w_00121'), bottomleft: i18n.__('w_00122'), bottomright: i18n.__('w_00123')},
    engine: {title: i18n.__('w_00132'), power: i18n.__('w_00133'), speed: i18n.__('w_00134'), rate: i18n.__('w_00186')},
    cut: {title: i18n.__('w_00136'), diameter: i18n.__('w_00137'), offsets: i18n.__('w_00138'), overlap: i18n.__('w_00139'), error: i18n.__('w_00140'), threshold: i18n.__('w_00141'), merge: i18n.__('w_00142'), order: i18n.__('w_00143'), sequence: i18n.__('w_00144')},
    halftone: {title: i18n.__('w_00136'), diameter: i18n.__('w_00137'), spotSize: i18n.__('w_00163'), minSpotsize: i18n.__('w_00164'), horSpotspace: i18n.__('w_00165'), verSpotspace: i18n.__('w_00166'), pointSpot: i18n.__('w_00167')}
  },
  submitButtonText: i18n.__('w_00146')
}

exports.laserPanelText = laserPanelText

var vinylPanelText = {
  roland: { switches: {title: i18n.__('w_00116'), autofocus: i18n.__('w_00117'), sort: i18n.__('w_00118'), fill: i18n.__('w_00168')},
    select: {material: {title: i18n.__('w_00127'), vinyl: i18n.__('w_00187'), epoxy: i18n.__('w_00188'), copper: i18n.__('w_00189')}},
    position: {title: i18n.__('w_00119'), topleft: i18n.__('w_00120'), topright: i18n.__('w_00121'), bottomleft: i18n.__('w_00122'), bottomright: i18n.__('w_00123')},
    engine: {title: i18n.__('w_00132'), force: i18n.__('w_00190'), velocity: i18n.__('w_00191')},
    cut: {title: i18n.__('w_00136'), diameter: i18n.__('w_00137'), offsets: i18n.__('w_00138'), overlap: i18n.__('w_00139'), error: i18n.__('w_00140'), threshold: i18n.__('w_00141'), merge: i18n.__('w_00142'), order: i18n.__('w_00143'), sequence: i18n.__('w_00144')}
  },
  submitButtonText: i18n.__('w_00146')
}

exports.vinylPanelText = vinylPanelText

var millingPanelText = {
  roland: { switches: {title: i18n.__('w_00116'), invert: i18n.__('w_00192'), sort: i18n.__('w_00118'), xz: i18n.__('w_00219'), yz: i18n.__('w_00220')},
    select: {process: {title: i18n.__('w_00124'), pcb: i18n.__('w_00193'), wax: i18n.__('w_00194')}, finishing: {title: i18n.__('w_00195'), pcb: {traces_1_64: i18n.__('w_00196'), outline_1_32: i18n.__('w_00197'), traces_0_010: i18n.__('w_00198')}, wax: {rough_cut: i18n.__('w_00199'), finish_cut: i18n.__('w_00200')}}, machine: {title: i18n.__('w_00205'), mdx15: i18n.__('w_00206'), mdx20: i18n.__('w_00207'), mdx40: i18n.__('w_00208'), srm20: i18n.__('w_00209')}},
    position: {title: i18n.__('w_00201'), toxyz: i18n.__('w_00202'), toxyzjog: i18n.__('w_00203'), toxyzhome: i18n.__('w_00204')},
    engine: {title: i18n.__('w_00132'), power: i18n.__('w_00133'), speed: i18n.__('w_00134'), rate: i18n.__('w_00135')},
    cut: {
      title: i18n.__('w_00136'),
      direction: i18n.__('w_00210'),
      conventional: i18n.__('w_00211'),
      climb: i18n.__('w_00212'),
      cutDepth: i18n.__('w_00213'),
      diameter: i18n.__('w_00137'),
      offsets: i18n.__('w_00138'),
      overlap: i18n.__('w_00139'),
      error: i18n.__('w_00140'),
      threshold: i18n.__('w_00141'),
      merge: i18n.__('w_00142'),
      order: i18n.__('w_00143'),
      sequence: i18n.__('w_00144'),
      thickness: i18n.__('w_00214')
    },

    wax: {
      title: i18n.__('w_00136'),
      bottomZ: i18n.__('w_00215'),
      bottomIntensity: i18n.__('w_00216'),
      topZ: i18n.__('w_00217'),
      topIntensity: i18n.__('w_00218'),
      xz: i18n.__('w_00219'),
      xy: i18n.__('w_00220'),
      type: i18n.__('w_00221'),
      flat: i18n.__('w_00222'),
      ball: i18n.__('w_00223'),
      direction: i18n.__('w_00210'),
      conventional: i18n.__('w_00211'),
      climb: i18n.__('w_00212'),
      cutDepth: i18n.__('w_00213'),
      diameter: i18n.__('w_00137'),
      offsets: i18n.__('w_00138'),
      overlap: i18n.__('w_00139'),
      error: i18n.__('w_00140'),
      merge: i18n.__('w_00142'),
      order: i18n.__('w_00143'),
      sequence: i18n.__('w_00144'),
      tool: i18n.__('w_00224')
    }
  },
  submitButtonText: i18n.__('w_00146')
}

exports.millingPanelText = millingPanelText

var print3dPanelText = {
  prusa: {
    title: i18n.__('w_00261'),
    model: {
      i3berlin: i18n.__('w_00262')
    }
  },
  submitButtonText: i18n.__('w_00146')
}

exports.print3dPanelText = print3dPanelText
