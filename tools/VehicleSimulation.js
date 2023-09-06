/** Conversion of the mass simulation and gear control stuff
 *  to javaScript for simulation.
 *
 *  Variable names are taken from the C-code side.
 *  Defines are mapped to varibles and "ifdef" are mapped to "if".
 *
 *  The internal variables are updated by calling the "step" function.
 *
 *  We are assuming that the "sample.js" file was loaded and so
 *  we have the samples available.
 *
 *  @class VehicleSimulation
 */
class VehicleSimulation {


  // values from vehicles.h
  TRACKED_MODE = false;
  AIRPLANE_MODE = false;
  EXCAVATOR_MODE = false;
  STEAM_LOCOMOTIVE_MODE = false;
  SUPER_SLOW = false;

  startVolumePercentage = 120;
  idleVolumePercentage = 72;
  engineIdleVolumePercentage = 60;
  fullThrottleVolumePercentage = 130;
  revVolumePercentage = 80;
  engineRevVolumePercentage = 60;

  REV_SOUND = true;
  revSwitchPoint = 10;
  idleEndPoint = 500;
  idleVolumeProportionPercentage = 90;

  JAKEBRAKE_ENGINE_SLOWDOWN = true;
  JAKE_BRAKE_SOUND = true;
  dieselKnockVolumePercentage = 40;
  dieselKnockIdleVolumePercentage = 0;
  dieselKnockStartPoint = 10;
  dieselKnockInterval = 8;

  V8 = true;
  dieselKnockAdaptiveVolumePercentage = 18;

  RPM_DEPENDENT_KNOCK = true;
  minKnockVolumePercentage = 80;
  knockStartRpm = 50;

  turboVolumePercentage = 5;
  turboIdleVolumePercentage = 0;
  chargerVolumePercentage = 0;
  chargerIdleVolumePercentage = 10;
  chargerStartPoint = 10;

  wastegateVolumePercentage = 18;
  wastegateIdleVolumePercentage = 1;

  fanVolumePercentage = 0;
  fanIdleVolumePercentage = 0;
  fanStartPoint = 0;

  hornVolumePercentage = 80;
  sirenVolumePercentage = 80;

  brakeVolumePercentage = 30;
  parkingBrakeVolumePercentage = 30;
  shiftingVolumePercentage = 40;
  sound1VolumePercentage = 100;

  reversingVolumePercentage = 14;

  indicatorVolumePercentage = 10;

  escRampTimeFirstGear = 20;
  escRampTimeSecondGear = 50;
  escRampTimeThirdGear = 75;
  escBrakeSteps = 30;
  escAccelerationSteps = 3;

  automatic = false;
  doubleClutch = false;
  shiftingAutoThrottle = true;
  clutchEngagingPoint = 90;

  MAX_RPM_PERCENTAGE = 330;

  acc = 2;
  dec = 1;

  // -- defines in 2_remotes.h
  AUTO_ENGINE_ON_OFF = true;
  AUTO_LIGHTS = true;

  // -- defines in 3_esc.h
  globalAccelerationPercentage = 100;

  // -- defines in 4_transmission.h
  OVERDRIVE = false; // Don't use it for: doubleClutch. Not working with SEMI_AUTOMATIC, but you can leave it on in this case.
  VIRTUAL_3_SPEED = false;
  VIRTUAL_16_SPEED_SEQUENTIAL = false;
  automaticReverseAccelerationPercentage = 100;
  lowRangePercentage = 58;
  SEMI_AUTOMATIC = false; // This will simulate a semi automatic transmission. Shifting is not controlled by the 3 position switch in this mode!
  TRANSMISSION_NEUTRAL = true;
  maxClutchSlippingRpm = 250; // The clutch will never slip above this limit! (about 250) 500 for vehicles like locomotives
  DOUBLE_CLUTCH = false;// Double-clutch (Zwischengas) Enable this for older manual transmission trucks without synchronised gears
  HIGH_SLIPPINGPOINT = false; // Clutch will engage @ higher RPM, if defined. Comment this out for heavy vehicles like semi trucks

  // -- defines in 8_Sound.h
  masterVolumeCrawlerThreshold = 44; // If master volume is <= this threshold, crawler mode (without virtual inertia) is active


  // -- variables and defines in src.ino

  sampleRate = 22050

  pulseWidth = 1500;  // Current RC signal for speed

  pulseMaxNeutral = 1600;
  pulseMinNeutral = 1400;
  pulseMax = 2000;
  pulseMin = 1000;
  pulseMaxLimit = 2100;
  pulseMinLimit =  900;

  pulseZero = 1500; // Usually 1500 (The mid point of 1000 - 2000 Microseconds)

  maxSampleInterval = 4000000 / this.sampleRate;
  minSampleInterval = 4000000 / this.sampleRate * 100 / this.MAX_RPM_PERCENTAGE;
  variableTimerTicks = this.maxSampleInterval;

  // Sound
  engineOn = false;                // Signal for engine on / off
  engineStart = false;             // Active, if engine is starting up
  engineRunning = false;           // Active, if engine is running
  engineStop = false;              // Active, if engine is shutting down
  jakeBrakeRequest = false;        // Active, if engine jake braking is requested
  engineJakeBraking = false;       // Active, if engine is jake braking
  wastegateTrigger = false;        // Trigger wastegate (blowoff) after rapid throttle drop
  blowoffTrigger = false;          // Trigger jake brake sound (blowoff) after rapid throttle drop
  dieselKnockTrigger = false;      // Trigger Diesel ignition "knock"
  dieselKnockTriggerFirst = false; // The first Diesel ignition "knock" per sequence
  airBrakeTrigger = false;         // Trigger for air brake noise
  parkingBrakeTrigger = false;     // Trigger for air parking brake noise
  shiftingTrigger = false;         // Trigger for shifting noise
  hornTrigger = false;             // Trigger for horn on / off
  sirenTrigger = false;            // Trigger for siren  on / off
  sound1trigger = false;           // Trigger for sound1  on / off
  couplingTrigger = false;         // Trigger for trailer coupling  sound
  uncouplingTrigger = false;       // Trigger for trailer uncoupling  sound
  bucketRattleTrigger = false;     // Trigger for bucket rattling  sound
  indicatorSoundOn = false;        // active, if indicator bulb is on
  outOfFuelMessageTrigger = false; // Trigger for out of fuel message

  // Sound latches
  hornLatch = false;  // Horn latch bit
  sirenLatch = false; // Siren latch bit

  // Sound volumes
  throttleDependentVolume = 0;        // engine volume according to throttle position
  throttleDependentRevVolume = 0;     // engine rev volume according to throttle position
  rpmDependentJakeBrakeVolume = 0;    // Engine rpm dependent jake brake volume
  throttleDependentKnockVolume = 0;   // engine Diesel knock volume according to throttle position
  rpmDependentKnockVolume = 0;        // engine Diesel knock volume according to engine RPM
  throttleDependentTurboVolume = 0;   // turbo volume according to rpm
  throttleDependentFanVolume = 0;     // cooling fan volume according to rpm
  throttleDependentChargerVolume = 0; // cooling fan volume according to rpm
  rpmDependentWastegateVolume = 0;    // wastegate volume according to rpm
  tireSquealVolume = 0;               // Tire squeal volume according to speed and cornering radius
  // for excavator mode:
  hydraulicPumpVolume = 0;             // hydraulic pump volume
  hydraulicFlowVolume = 0;             // hydraulic flow volume
  trackRattleVolume = 0;               // track rattling volume
  hydraulicDependentKnockVolume = 100; // engine Diesel knock volume according to hydraulic load
  hydraulicLoad = 0;                   // Hydraulic load dependent RPM drop

  dacDebug = 0; // DAC debug variable TODO

  masterVolume = 100; // Master volume percentage
  dacOffset = 128;      // 128, but needs to be ramped up slowly to prevent popping noise, if switched on

  // Throttle
  currentThrottle = 0;      // 0 - 500 (Throttle trigger input)
  currentThrottleFaded = 0; // faded throttle for volume calculations etc.

  // Engine
  maxRpm = 500;       // always 500
  minRpm = 0;         // always 0
  currentRpm = 0;           // 0 - 500 (signed required!)

  engineState = 0; // Engine state
  engineStateOFF = 0;   // Engine is off
  engineStateSTARTING = 1; // Engine is starting
  engineStateRUNNING = 2;  // Engine is running
  engineStateSTOPPING = 3; // Engine is stopping
  engineStatePARKING_BRAKE = 4;

  engineLoad = 0;       // 0 - 500
  engineSampleRate = 0; // Engine sample rate
  speedLimit = this.maxRpm;  // The speed limit, depending on selected virtual gear

  clutchDisengaged = true; // Active while clutch is disengaged

  // Transmission
  selectedGear = 1;             // The currently used gear of our shifting gearbox
  selectedAutomaticGear = 1;    // The currently used gear of our automatic gearbox
  gearUpShiftingInProgress = false;     // Active while shifting upwards
  doubleClutchInProgress = false;       // Double-clutch (Zwischengas)
  gearDownShiftingInProgress = false;   // Active while shifting downwards
  gearUpShiftingPulse = false;          // Active, if shifting upwards begins
  gearDownShiftingPulse = false;        // Active, if shifting downwards begins
  neutralGear = false; // Transmission in neutral
  lowRange = false;             // Transmission range (off road reducer)

  escIsBraking = false; // ESC is in a braking state
  escIsDriving = false; // ESC is in a driving state
  escInReverse = false; // ESC is driving or braking backwards
  brakeDetect  = false;  // Additional brake detect signal, enabled immediately, if brake applied

  driveState = 0;                 // for ESC state machine
  escPulseMax = 2000;           // ESC calibration variables (values will be changed later)
  escPulseMin = 1000;
  escPulseMaxNeutral = 1500;
  escPulseMinNeutral = 1500;
  currentSpeed = 0;         // 0 - 500 (current ESC power)
  crawlerMode = false; // Crawler mode intended for crawling competitons (withouth sound and virtual inertia)

  escPulseWidth = 1500;
  escPulseWidthOut = 1500;
  escSignal = 1500;
  motorDriverDuty = 0;
  escMillis = 0;
  lastStateTime = 0;
  // static int8_t pulse; // -1 = reverse, 0 = neutral, 1 = forward
  // static int8_t escPulse; // -1 = reverse, 0 = neutral, 1 = forward
  driveRampRate = 0;
  driveRampGain = 0;
  brakeRampRate = 0;
  escRampTime = 0;

  // Lights
  lightsState = 0;                        // for lights state machine
  lightsOn = false;             // Lights on
  headLightsFlasherOn = false;  // Headlights flasher impulse (Lichthupe)
  headLightsHighBeamOn = false; // Headlights high beam (Fernlicht)
  blueLightTrigger = false;     // Bluelight on (Blaulicht)
  indicatorLon = false;                  // Left indicator (Blinker links)
  indicatorRon = false;                  // Right indicator (Blinker rechts)
  fogLightOn = false;                    // Fog light is on
  cannonFlash = false;                   // Flashing cannon fire

  // Trailer
  legsUp = false;
  legsDown = false;
  rampsUp = false;
  rampsDown = false;
  trailerDetected = false;

  // Battery
  batteryCutoffvoltage;
  batteryVoltage;
  numberOfCells;
  batteryProtection = false;

  failSafe = false;


  // -- defined in curves.h
  torqueconverterSlipPercentage = 100;
  gearRatio = [10, 37, 29, 22, 17, 13, 10]; // todo: there is more than only this.
  curveLinear = [
    [0, 0] // {input value, output value}
    , [83, 200]
    , [166, 260]
    , [250, 320]
    , [333, 380]
    , [416, 440]
    , [500, 500]
    , [600, 500] // overload range > 500 will limit output to 500
  ];

  map(input, min1, max1, min2, max2) {
    let out = (((input - min1) / (max1 - min1))
      * (max2 - min2)) + min2;
    if (out > max2) {
      out = max2;
    } else if (out < min2) {
      out = min1;
    }
    return out;
  }

  reMap(pts, input) {
    let rr = 0;
    let mm = 0;

    for (let nn = 0; nn < pts.length - 1; nn++) {
      if (input >= pts[nn][0] && input <= pts[nn + 1][0]) {
        mm = ( pts[nn][1] - pts[nn + 1][1] ) / ( pts[nn][0] - pts[nn + 1][0] );
        mm = mm * (input - pts[nn][0]);
        mm = mm +  pts[nn][1];
        rr = mm;
      }
    }
    return rr;
  }

  // -- static variables from mapThrottle
  throttleFaderMicros = 0;
  blowoffLock = 0;

  // -- static variables from engineMassSimulation
  targetRpm = 0;   // The engine RPM target
  _currentRpm = 0; // Private current RPM (to prevent conflict with core 1)
  _currentThrottle = 0;
  lastThrottle = 0;
  converterSlip = 0;
  throtMillis = 0;
  wastegateMillis = 0;
  blowoffMillis = 0;

  // -- static variables from engineOnOff
  idleDelayMillis = 0;

  // -- static variables from gearboxDetection
  previousGear = 1;
  previousReverse = 0;
  sequentialLock = 0;
  overdrive = false;
  upShiftingMillis = 0;
  downShiftingMillis = 0;
  lastShiftingMillis = 0; // This timer is used to prevent transmission from oscillating!

  // -- static variables from variablePlaybackTimer
  attenuatorMillis = 0;
  curEngineSample = 0;          // Index of currently loaded engine sample
  curRevSample = 0;             // Index of currently loaded engine rev sample
  curTurboSample = 0;           // Index of currently loaded turbo sample
  curFanSample = 0;             // Index of currently loaded fan sample
  curChargerSample = 0;         // Index of currently loaded charger sample
  curStartSample = 0;           // Index of currently loaded start sample
  curJakeBrakeSample = 0;       // Index of currently loaded jake brake sample
  curHydraulicPumpSample = 0;   // Index of currently loaded hydraulic pump sample
  curTrackRattleSample = 0;     // Index of currently loaded train track rattle sample
  lastDieselKnockSample = 0;    // Index of last Diesel knock sample
  attenuator = 0;               // Used for volume adjustment during engine switch off
  speedPercentage = 0;          // slows the engine down during shutdown


  currentMillis = 0;

  sampleList = [
      'start',
      'rev',
      'jakeBrake',
      'turbo',
      'fan',
      'charger',
      'hydraulicPump',
      'trackRattle',
  ];

  /** Creates the object.
   *
   *  Creates the samples from a list.
   */
  constructor() {

      this["samples"] = new Int8Array();
      this["sampleCount"] = 0;
      for (let i = 0; i < this.sampleList.length; i++) {
          const sampleName = this.sampleList[i];
          this[sampleName + "Samples"] = new Int8Array();
          this[sampleName + "SampleCount"] = 0;
      }
  }

  step(millis) {
    this.currentMillis += millis;
  }

  millis() {
    return this.currentMillis;
  }

  micros() {
    return this.currentMillis * 1000;
  }

  constrain(value, min, max) {
    if (value < min)
      return min;
    if (value > max)
      return max;
    return value;
  }

  pulse()
  { // Throttle direction
    let pulse;
    if (this.pulseWidth > this.pulseMaxNeutral && this.pulseWidth < this.pulseMaxLimit)
      pulse = 1; // 1 = Forward
    else if (this.pulseWidth < this.pulseMinNeutral && this.pulseWidth > this.pulseMinLimit)
      pulse = -1; // -1 = Backwards
    else
      pulse = 0; // 0 = Neutral
    return pulse;
  }

  escPulse()
  { // ESC direction
    let escPulse;
    if (this.escPulseWidth > this.pulseMaxNeutral && this.escPulseWidth < this.pulseMaxLimit)
      escPulse = 1; // 1 = Forward
    else if (this.escPulseWidth < this.pulseMinNeutral && this.escPulseWidth > this.pulseMinLimit)
      escPulse = -1; // -1 = Backwards
    else
      escPulse = 0; // 0 = Neutral
    return escPulse;
  }

  /** The original mapThrottle function, but most of the puls-width
   *  stuff is removed.
   *  Instead we start with currentThrottle
   */
  mapThrottle()
  {
    // calculate a throttle value from the pulsewidth signal
    if (this.pulseWidth > this.pulseMaxNeutral)
    {
      this.currentThrottle = this.map(this.pulseWidth, this.pulseMaxNeutral, this.pulseMax, 0, 500);
    }
    else if (this.pulseWidth < this.pulseMinNeutral)
    {
      this.currentThrottle = this.map(this.pulseWidth, this.pulseMinNeutral, this.pulseMin, 0, 500);
    }
    else
    {
      this.currentThrottle = 0;
    }

    // Auto throttle --------------------------------------------------------------------------
    if (!this.EXCAVATOR_MODE) {
      // Auto throttle while gear shifting (synchronizing the Tamiya 3 speed gearbox)
      if (!this.escIsBraking && this.escIsDriving && this.shiftingAutoThrottle && !this.automatic && !this.doubleClutch)
      {
        if (this.gearUpShiftingInProgress && !this.doubleClutchInProgress)
          currentThrottle = 0; // No throttle
        if (this.gearDownShiftingInProgress || this.doubleClutchInProgress)
          this.currentThrottle = 500;                              // Full throttle
        this.currentThrottle = this.constrain(this.currentThrottle, 0, 500); // Limit throttle range
      }
    }


    // Volume calculations --------------------------------------------------------------------------

    // As a base for some calculations below, fade the current throttle to make it more natural
    if (this.micros() - this.throttleFaderMicros > 500)
    { // Every 0.5ms
      this.throttleFaderMicros = this.micros();

      if (this.currentThrottleFaded < this.currentThrottle && !this.escIsBraking && this.currentThrottleFaded < 499)
        this.currentThrottleFaded += 2;
      if ((this.currentThrottleFaded > this.currentThrottle || this.escIsBraking) && this.currentThrottleFaded > 2)
        this.currentThrottleFaded -= 2;

      // Calculate throttle dependent engine idle volume
      if (!this.escIsBraking && !this.brakeDetect && this.engineRunning)
        this.throttleDependentVolume = this.map(this.currentThrottleFaded, 0, 500, this.engineIdleVolumePercentage, this.fullThrottleVolumePercentage);
      // else throttleDependentVolume = engineIdleVolumePercentage; // TODO
      else
      {
        if (this.throttleDependentVolume > this.engineIdleVolumePercentage)
          this.throttleDependentVolume--;
        else
          this.throttleDependentVolume = this.engineIdleVolumePercentage;
      }

      // Calculate throttle dependent engine rev volume
      if (!this.escIsBraking && !this.brakeDetect && this.engineRunning)
        this.throttleDependentRevVolume = this.map(this.currentThrottleFaded, 0, 500, this.engineRevVolumePercentage, this.fullThrottleVolumePercentage);
      // else throttleDependentRevVolume = engineRevVolumePercentage; // TODO
      else
      {
        if (this.throttleDependentRevVolume > this.engineRevVolumePercentage)
          this.throttleDependentRevVolume--;
        else
          this.throttleDependentRevVolume = this.engineRevVolumePercentage;
      }

      // Calculate throttle dependent Diesel knock volume
      if (!this.escIsBraking && !this.brakeDetect && this.engineRunning && (this.currentThrottleFaded > this.dieselKnockStartPoint))
        this.throttleDependentKnockVolume = this.map(this.currentThrottleFaded, this.dieselKnockStartPoint, 500, this.dieselKnockIdleVolumePercentage, 100);
      // else throttleDependentKnockVolume = dieselKnockIdleVolumePercentage;
      else
      {
        if (this.throttleDependentKnockVolume > this.dieselKnockIdleVolumePercentage)
          this.throttleDependentKnockVolume--;
        else
          this.throttleDependentKnockVolume = this.dieselKnockIdleVolumePercentage;
      }

      // Calculate engine rpm dependent jake brake volume
      if (this.engineRunning)
        this.rpmDependentJakeBrakeVolume = this.map(this.currentRpm, 0, 500, this.jakeBrakeIdleVolumePercentage, 100);
      else
        this.rpmDependentJakeBrakeVolume = this.jakeBrakeIdleVolumePercentage;

      if (this.RPM_DEPENDENT_KNOCK) {
        // Calculate RPM dependent Diesel knock volume
        if (this.currentRpm > 400)
          this.rpmDependentKnockVolume = this.map(this.currentRpm, this.knockStartRpm, 500, this.minKnockVolumePercentage, 100);
        else
          this.rpmDependentKnockVolume = this.minKnockVolumePercentage;
      }

      // Calculate engine rpm dependent turbo volume
      if (this.engineRunning)
        this.throttleDependentTurboVolume = this.map(this.currentRpm, 0, 500, this.turboIdleVolumePercentage, 100);
      else
        this.throttleDependentTurboVolume = this.turboIdleVolumePercentage;

      // Calculate engine rpm dependent cooling fan volume
      if (this.engineRunning && (this.currentRpm > this.fanStartPoint))
        this.throttleDependentFanVolume = this.map(this.currentRpm, this.fanStartPoint, 500, this.fanIdleVolumePercentage, 100);
      else
        this.throttleDependentFanVolume = this.fanIdleVolumePercentage;

      // Calculate throttle dependent supercharger volume
      if (!this.escIsBraking && !this.brakeDetect && this.engineRunning && (this.currentRpm > this.chargerStartPoint))
        this.throttleDependentChargerVolume = this.map(this.currentThrottleFaded, this.chargerStartPoint, 500, this.chargerIdleVolumePercentage, 100);
      else
        this.throttleDependentChargerVolume = this.chargerIdleVolumePercentage;

      // Calculate engine rpm dependent wastegate volume
      if (this.engineRunning)
        this.rpmDependentWastegateVolume = this.map(this.currentRpm, 0, 500, this.wastegateIdleVolumePercentage, 100);
      else
        this.rpmDependentWastegateVolume = this.wastegateIdleVolumePercentage;
    }

    // Calculate engine load (used for torque converter slip simulation)
    this.engineLoad = this.currentThrottle - this.currentRpm;

    if (this.engineLoad < 0 || this.escIsBraking || this.brakeDetect)
      this.engineLoad = 0; // Range is 0 - 180
    if (this.engineLoad > 180)
      this.engineLoad = 180;

    // Additional sounds volumes -----------------------------

    // Tire squealing ----
    let steeringAngle = 0;
    let brakeSquealVolume = 0;

    // Cornering squealing
    /*
    if (pulseWidth[1] < 1500)
      steeringAngle = map(pulseWidth[1], 1000, 1500, 100, 0);
    else if (pulseWidth[1] > 1500)
      steeringAngle = map(pulseWidth[1], 1500, 2000, 0, 100);
    else
      steeringAngle = 0;

    tireSquealVolume = steeringAngle * currentSpeed * currentSpeed / 125000; // Volume = steering angle * speed * speed
    */

    // Brake squealing
    if ((this.driveState == 2 || this.driveState == 4) && this.currentSpeed > 50 && this.currentThrottle > 250)
    {
      this.tireSquealVolume += this.map(this.currentThrottle, 250, 500, 0, 100);
    }

    this.tireSquealVolume = this.constrain(this.tireSquealVolume, 0, 100);
  }

  engineMassSimulation() {

    let timeBase;

    if (this.SUPER_SLOW)
      timeBase = 6; // super slow running, heavy engines, for example locomotive diesels
    else
      timeBase = 2;

    this._currentThrottle = this.currentThrottle;

    if (this.millis() - this.throtMillis > timeBase)
    { // Every 2 or 6ms
      this.throtMillis = this.millis();

      if (this._currentThrottle > 500)
        this._currentThrottle = 500;

        // Virtual clutch **********************************************************************************
      if (this.EXCAVATOR_MODE) { // Excavator mode ---
        this.clutchDisengaged = true;

        this.targetRpm = this._currentThrottle - this.hydraulicLoad;
        this.targetRpm = this.constrain(this.targetRpm, 0, 500);

      } else {

        if ((this.currentSpeed < this.clutchEngagingPoint && this._currentRpm < this.maxClutchSlippingRpm) || this.gearUpShiftingInProgress || this.gearDownShiftingInProgress || this.neutralGear)
        {
          this.clutchDisengaged = true;
        }
        else
        {
          this.clutchDisengaged = false;
        }

        // Transmissions ************************************

        // automatic transmission ----
        if (this.automatic)
        {
          // Torque converter slip calculation
          if (this.selectedAutomaticGear < 2)
            this.converterSlip = this.engineLoad * this.torqueconverterSlipPercentage / 100 * 2; // more slip in first and reverse gear
          else
            this.converterSlip = this.engineLoad * this.torqueconverterSlipPercentage / 100;

          if (!this.neutralGear)
            this.targetRpm = this.currentSpeed * this.gearRatio[this.selectedAutomaticGear] / 10 + this.converterSlip; // Compute engine RPM
          else
            this.targetRpm = this.reMap(this.curveLinear, this._currentThrottle);
        }
        else if (this.doubleClutch)
        {
          // double clutch transmission
          if (!this.neutralGear)
            this.targetRpm = this.currentSpeed * this.gearRatio[this.selectedAutomaticGear] / 10; // Compute engine RPM
          else
            this.targetRpm = this.reMap(this.curveLinear, this._currentThrottle);
        }
        else
        {
          // Manual transmission ----
          if (this.clutchDisengaged)
          { // Clutch disengaged: Engine revving allowed
            if (this.VIRTUAL_16_SPEED_SEQUENTIAL)
              this.targetRpm = this._currentThrottle;
            else 
              this.targetRpm = this.reMap(this.curveLinear, this._currentThrottle);
          }
          else
          {  // Clutch engaged: Engine rpm synchronized with ESC power (speed)

            if (this.VIRTUAL_3_SPEED || this.VIRTUAL_16_SPEED_SEQUENTIAL) { // Virtual 3 speed or sequential 16 speed transmission
              this.targetRpm = this.reMap(this.curveLinear, (this.currentSpeed * virtualManualGearRatio[this.selectedGear] / 10)); // Add virtual gear ratios
              if (this.targetRpm > 500)
                this.targetRpm = 500;

            } else if (this.STEAM_LOCOMOTIVE_MODE) {
              this.targetRpm = this.currentSpeed;

            } else { // Real 3 speed transmission
              this.targetRpm = this.reMap(this.curveLinear, this.currentSpeed);
            }
          }
        }
      } // not excavator mode

      // Engine RPM **************************************************************************************

      if (this.escIsBraking && this.currentSpeed < this.clutchEngagingPoint)
        this.targetRpm = 0; // keep engine @idle rpm, if braking at very low speed
      if (this.targetRpm > 500)
        this.targetRpm = 500;

      // Accelerate engine
      if (this.targetRpm > (this._currentRpm + this.acc) && (this._currentRpm + this.acc) < this.maxRpm && this.engineState == this.engineStateRUNNING && this.engineRunning)
      {
        if (!this.airBrakeTrigger)
        { // No acceleration, if brake release noise still playing
          if (!this.gearDownShiftingInProgress)
            this._currentRpm += this.acc;
          else
            this._currentRpm += this.acc / 2; // less aggressive rpm rise while downshifting
          if (this._currentRpm > this.maxRpm)
            this._currentRpm = this.maxRpm;
        }
      }

      // Decelerate engine
      if (this.targetRpm < this._currentRpm)
      {
        this._currentRpm -= this.dec;
        if (this._currentRpm < this.minRpm)
          this._currentRpm = this.minRpm;
      }

      if ((this.VIRTUAL_3_SPEED || this.VIRTUAL_16_SPEED_SEQUENTIAL) && !STEAM_LOCOMOTIVE_MODE) {
        // Limit top speed, depending on manual gear ratio. Ensures, that the engine will not blow up!
        if (!this.automatic && !this.doubleClutch)
          this.speedLimit = this.maxRpm * 10 / virtualManualGearRatio[this.selectedGear];
      }

      // Speed (sample rate) output
      this.engineSampleRate = this.map(this._currentRpm, this.minRpm, this.maxRpm, this.maxSampleInterval, this.minSampleInterval); // Idle

      // if ( xSemaphoreTake( xRpmSemaphore, portMAX_DELAY ) )
      //{
      this.currentRpm = this._currentRpm;
      // xSemaphoreGive( xRpmSemaphore ); // Now free or "Give" the semaphore for others.
      // }
    }

    // Prevent Wastegate from being triggered while downshifting
    if (this.gearDownShiftingInProgress)
      this.wastegateMillis = this.millis();

    // Trigger Wastegate, if throttle rapidly dropped
    if (this.lastThrottle - this._currentThrottle > 70 && !this.escIsBraking && this.millis() - this.wastegateMillis > 1000)
    {
      this.wastegateMillis = this.millis();
      this.wastegateTrigger = true;
    }

    if (this.JAKEBRAKE_ENGINE_SLOWDOWN && this.JAKE_BRAKE_SOUND) {
      // Use jake brake to slow down engine while releasing throttle in neutral or during upshifting while applying throttle
      // for some vehicles like Volvo FH open pipe. See example: https://www.youtube.com/watch?v=MU1iwzl33Zw&list=LL&index=4
      if (!this.wastegateTrigger)
        this.blowoffMillis = this.millis();
      this.blowoffTrigger = ((this.gearUpShiftingInProgress || this.neutralGear) && this.millis() - this.blowoffMillis > 20 && this.millis() - this.blowoffMillis < 250);
    }

    this.lastThrottle = this._currentThrottle;
  }

  //
  // =======================================================================================================
  // SWITCH ENGINE ON OR OFF (for automatic mode)
  // =======================================================================================================
  //

  engineOnOff()
  {

    // static unsigned long pulseDelayMillis; // TODO

    // Engine automatically switched on or off depending on throttle position and 15s delay timne
    if (this.currentThrottle > 80 || this.driveState != 0)
      this.idleDelayMillis = this.millis(); // reset delay timer, if throttle not in neutral

    if (this.AUTO_ENGINE_ON_OFF) {
      if (this.millis() - this.idleDelayMillis > 15000)
      {
        this.engineOn = false; // after delay, switch engine off
      }
    }

    if (this.AUTO_LIGHTS) {
      if (this.millis() - this.idleDelayMillis > 10000)
      {
        this.lightsOn = false; // after delay, switch light off
      }
    }

    // Engine start detection
    if (this.currentThrottle > 100 && !this.airBrakeTrigger)
    {
      this.engineOn = true;

      if (this.AUTO_LIGHTS) {
        this.lightsOn = true;
      }
    }
  }

  gearboxDetection()
  {
    if (this.TRACKED_MODE || this.STEAM_LOCOMOTIVE_MODE) { // CH2 is used for left throttle in TRACKED_MODE --------------------------------
      this.selectedGear = 2;

     } else { // only active, if not in TRACKED_MODE -------------------------------------------------------------

      if (this.OVERDRIVE && this.VIRTUAL_3_SPEED) { // Additional 4th gear mode for virtual 3 speed ********************************
        if (!this.crawlerMode)
        {
          // The 4th gear (overdrive) is engaged automatically, if driving @ full throttle in 3rd gear
          if (this.currentRpm > 490 && this.selectedGear == 3 && this.engineLoad < 5 && this.currentThrottle > 490 && this.millis() - this.lastShiftingMillis > 2000)
          {
            this.overdrive = true;
          }
          if (!this.escIsBraking)
          { // Lower downshift point, if not braking
            if (this.currentRpm < 200 && this.millis() - this.lastShiftingMillis > 2000)
            {
              this.overdrive = false;
            }
          }
          else
          { // Higher downshift point, if braking
            if ((this.currentRpm < 400 || this.engineLoad > 150) && this.millis() - lastShiftingMillis > 2000)
            {
              this.overdrive = false;
            }
          }
          if (this.selectedGear < 3)
            this.overdrive = false;
        }
      }

      /* removed gear selection */

      if (this.SEMI_AUTOMATIC) { // gears not controlled by the 3 position switch but by RPM limits ************************************
        if (this.currentRpm > 490 && this.selectedGear < 3 && this.engineLoad < 5 && this.currentThrottle > 490 && this.millis() - this.lastShiftingMillis > 2000)
        {
          this.selectedGear++;
        }
        if (!this.escIsBraking)
        { // Lower downshift point, if not braking
          if (this.currentRpm < 200 && this.selectedGear > 1 && this.millis() - this.lastShiftingMillis > 2000)
          {
            this.selectedGear--; //
          }
        }
        else
        { // Higher downshift point, if braking
          if ((this.currentRpm < 400 || this.engineLoad > 150) && this.selectedGear > 1 && this.millis() - this.lastShiftingMillis > 2000)
          {
            this.selectedGear--; // Higher downshift point, if braking
          }
        }
        if (this.neutralGear || this.escInReverse)
          this.selectedGear = 1;
      }

      // Gear upshifting detection
      if (this.selectedGear > this.previousGear)
      {
        this.gearUpShiftingInProgress = true;
        this.gearUpShiftingPulse = true;
        this.shiftingTrigger = true;
        this.previousGear = this.selectedGear;
        this.lastShiftingMillis = this.millis();
      }

      // Gear upshifting duration
      let upshiftingDuration = 700;
      if (!this.gearUpShiftingInProgress)
        this.upShiftingMillis = this.millis();
      if (this.millis() - this.upShiftingMillis > this.upshiftingDuration)
      {
        this.gearUpShiftingInProgress = false;
      }
      // Double-clutch (Zwischengas während dem Hochschalten)
      if (this.DOUBLE_CLUTCH) {
        this.upshiftingDuration = 900;
        this.doubleClutchInProgress = (this.millis() - this.upShiftingMillis >= 500 && this.millis() - this.upShiftingMillis < 600); // Apply full throttle
      }

      // Gear downshifting detection
      if (this.selectedGear < this.previousGear)
      {
        this.gearDownShiftingInProgress = true;
        this.gearDownShiftingPulse = true;
        this.shiftingTrigger = true;
        this.previousGear = this.selectedGear;
        this.lastShiftingMillis = this.millis();
      }

      // Gear downshifting duration
      if (!this.gearDownShiftingInProgress)
        this.downShiftingMillis = this.millis();
      if (this.millis() - this.downShiftingMillis > 300)
      {
        this.gearDownShiftingInProgress = false;
      }

      // Reverse gear engaging / disengaging detection
      if (this.escInReverse != this.previousReverse)
      {
        this.previousReverse = this.escInReverse;
        this.shiftingTrigger = true; // Play shifting sound
      }

    }
  }

  esc()
  { // ESC main function ================================

    // Battery protection --------------------------------
    // -- removed

    if (!this.TRACKED_MODE && !this.AIRPLANE_MODE) { // No ESC control in TRACKED_MODE or in AIRPLANE_MODE
      // Gear dependent ramp speed for acceleration & deceleration
      if (this.VIRTUAL_3_SPEED) {
        this.escRampTime = this.escRampTimeThirdGear * 10 / this.virtualManualGearRatio[this.selectedGear];

      } else if (this.VIRTUAL_16_SPEED_SEQUENTIAL) {
        this.escRampTime = this.escRampTimeThirdGear * this.virtualManualGearRatio[this.selectedGear] / 5;

      } else if (this.STEAM_LOCOMOTIVE_MODE) {
        this.escRampTime = this.escRampTimeSecondGear;

      } else {
        if (this.selectedGear == 1)
          this.escRampTime = this.escRampTimeFirstGear; // about 20
        if (this.selectedGear == 2)
          this.escRampTime = this.escRampTimeSecondGear; // about 50
        if (this.selectedGear == 3)
          this.escRampTime = this.escRampTimeThirdGear; // about 75
      }

      if (this.automatic || this.doubleClutch)
      {
        this.escRampTime = this.escRampTimeSecondGear; // always use 2nd gear acceleration for automatic transmissions
        if (this.escInReverse)
          this.escRampTime = this.escRampTime * 100 / this.automaticReverseAccelerationPercentage; // faster acceleration in automatic reverse, EXPERIMENTAL, TODO!
      }

      // Allows to scale vehicle file dependent acceleration
      this.escRampTime = this.escRampTime * 100 / this.globalAccelerationPercentage;

      // ESC ramp time compensation in low range
      if (this.lowRange)
        this.escRampTime = this.escRampTime * this.lowRangePercentage / 100;

      // Drive mode -------------------------------------------
      // Crawler mode for direct control -----
      this.crawlerMode = (this.masterVolume <= this.masterVolumeCrawlerThreshold); // Direct control, depending on master volume

      if (this.crawlerMode)
      { // almost no virtual inertia (just for drive train protection), for crawling competitions
        this.escRampTime = this.crawlerEscRampTime;
        this.brakeRampRate = this.map(this.currentThrottle, 0, 500, 1, 10);
        this.driveRampRate = 10;
      }
      else
      { // Virtual inertia mode -----
        // calulate throttle dependent brake & acceleration steps
        this.brakeRampRate = this.map(this.currentThrottle, 0, 500, 1, this.escBrakeSteps);
        this.driveRampRate = this.map(this.currentThrottle, 0, 500, 1, this.escAccelerationSteps);
      } // ----------------------------------------------------

      // Emergency ramp rates for falisafe
      if (this.failSafe)
      {
        this.brakeRampRate = this.escBrakeSteps;
        this.driveRampRate = this.escBrakeSteps;
      }

      // Additional brake detection signal, applied immediately. Used to prevent sound issues, if braking very quickly
      this.brakeDetect = ((this.pulse() == 1 && this.escPulse() == -1) || (this.pulse() == -1 && this.escPulse() == 1));


      if (this.millis() - this.escMillis > this.escRampTime)
      { // About very 20 - 75ms
        this.escMillis = this.millis();

        // Drive state state machine **********************************************************************************
        switch (this.driveState)
        {

        case 0: // Standing still ---------------------------------------------------------------------
          this.escIsBraking = false;
          this.escInReverse = false;
          this.escIsDriving = false;
          this.escPulseWidth = this.pulseZero; // ESC to neutral position
          if (this.VIRTUAL_16_SPEED_SEQUENTIAL) {
            this.selectedGear = 1;
          }

          if (this.pulse() == 1 && this.engineRunning && !this.neutralGear)
            this.driveState = 1; // Driving forward
          if (this.pulse() == -1 && this.engineRunning && !this.neutralGear)
            this.driveState = 3; // Driving backwards
          break;

        case 1: // Driving forward ---------------------------------------------------------------------
          this.escIsBraking = false;
          this.escInReverse = false;
          this.escIsDriving = true;
          if (this.escPulseWidth < this.pulseWidth && this.currentSpeed < this.speedLimit && !this.batteryProtection)
          {
            if (this.escPulseWidth >= this.escPulseMaxNeutral)
              this.escPulseWidth += (this.driveRampRate * this.driveRampGain); // Faster
            else
              this.escPulseWidth = this.escPulseMaxNeutral; // Initial boost
          }
          if ((this.escPulseWidth > this.pulseWidth || this.batteryProtection) && this.escPulseWidth > this.pulseZero)
            this.escPulseWidth -= (this.driveRampRate * this.driveRampGain); // Slower

          if (this.gearUpShiftingPulse && this.shiftingAutoThrottle && !this.automatic && !this.doubleClutch)
          {                                                                    // lowering RPM, if shifting up transmission
            if (!this.VIRTUAL_3_SPEED && !this.VIRTUAL_16_SPEED_SEQUENTIAL) { // Only, if we have a real 3 speed transmission
              this.escPulseWidth -= this.currentSpeed / 4;                                 // Synchronize engine speed
                                                                               // escPulseWidth -= currentSpeed * 40 / 100; // Synchronize engine speed TODO
            }
            this.gearUpShiftingPulse = false;
            this.escPulseWidth = this.constrain(this.escPulseWidth, this.pulseZero, this.pulseMax);
          }
          if (this.gearDownShiftingPulse && this.shiftingAutoThrottle && !this.automatic && !this.doubleClutch)
          {                                                                    // increasing RPM, if shifting down transmission
            if (!this.VIRTUAL_3_SPEED && !this.VIRTUAL_16_SPEED_SEQUENTIAL) { // Only, if we have a real 3 speed transmission
              this.escPulseWidth += 50;                                               // Synchronize engine speed
                                                                               // escPulseWidth += currentSpeed;// * 40 / 100; // Synchronize engine speed TODO
            }
            this.gearDownShiftingPulse = false;
            this.escPulseWidth = this.constrain(this.escPulseWidth, this.pulseZero, this.pulseMax);
          }

          if (this.pulse() == -1 && this.escPulse() == 1)
            this.driveState = 2; // Braking forward
          if (this.pulse() == -1 && this.escPulse() == 0)
            driveState = 3; // Driving backwards, if ESC not yet moving. Prevents state machine from hanging! v9.7.0
          if (this.pulse() == 0 && this.escPulse() == 0)
            this.driveState = 0; // standing still
          break;

        case 2: // Braking forward ---------------------------------------------------------------------
          this.escIsBraking = true;
          this.escInReverse = false;
          this.escIsDriving = false;
          if (this.escPulseWidth > this.pulseZero)
            this.escPulseWidth -= this.brakeRampRate; // brake with variable deceleration
          if (this.escPulseWidth < this.pulseZero + this.brakeMargin && this.pulse() == -1)
            this.escPulseWidth = this.pulseZero + this.brakeMargin; // Don't go completely back to neutral, if brake applied
          if (this.escPulseWidth < this.pulseZero && this.pulse() == 0)
            this.escPulseWidth = this.pulseZero; // Overflow prevention!

          if (this.pulse() == 0 && this.escPulse() == 1 && !this.neutralGear)
          {
            this.driveState = 1; // Driving forward
            this.airBrakeTrigger = true;
          }
          if (this.pulse() == 0 && this.escPulse() == 0)
          {
            this.driveState = 0; // standing still
            this.airBrakeTrigger = true;
          }
          break;

        case 3: // Driving backwards ---------------------------------------------------------------------
          this.escIsBraking = false;
          this.escInReverse = true;
          this.escIsDriving = true;
          if (this.escPulseWidth > this.pulseWidth && this.currentSpeed < this.speedLimit && !this.batteryProtection)
          {
            if (this.escPulseWidth <= this.escPulseMinNeutral)
              this.escPulseWidth -= (this.driveRampRate * this.driveRampGain); // Faster
            else
              this.escPulseWidth = this.escPulseMinNeutral; // Initial boost
          }
          if ((this.escPulseWidth < this.pulseWidth || this.batteryProtection) && this.escPulseWidth < this.pulseZero)
            this.escPulseWidth += (this.driveRampRate * this.driveRampGain); // Slower

          if (this.gearUpShiftingPulse && this.shiftingAutoThrottle && !this.automatic && !this.doubleClutch)
          {                                                                    // lowering RPM, if shifting up transmission
            if (!this.VIRTUAL_3_SPEED && !this.VIRTUAL_16_SPEED_SEQUENTIAL) { // Only, if we have a real 3 speed transmission
              this.escPulseWidth += this.currentSpeed / 4;                                 // Synchronize engine speed
            }
            this.gearUpShiftingPulse = false;
            this.escPulseWidth = this.constrain(this.escPulseWidth, this.pulseMin, this.pulseZero);
          }
          if (this.gearDownShiftingPulse && this.shiftingAutoThrottle && !this.automatic && !this.doubleClutch)
          {                                                                    // increasing RPM, if shifting down transmission
            if (!this.VIRTUAL_3_SPEED && !this.VIRTUAL_16_SPEED_SEQUENTIAL) { // Only, if we have a real 3 speed transmission
              this.escPulseWidth -= 50;                                               // Synchronize engine speed
            }
            this.gearDownShiftingPulse = false;
            this.escPulseWidth = this.constrain(this.escPulseWidth, this.pulseMin, this.pulseZero);
          }

          if (this.pulse() == 1 && this.escPulse() == -1)
            this.driveState = 4; // Braking backwards
          if (this.pulse() == 1 && this.escPulse() == 0)
            this.driveState = 1; // Driving forward, if ESC not yet moving. Prevents state machine from hanging! v9.7.0
          if (this.pulse() == 0 && this.escPulse() == 0)
            this.driveState = 0; // standing still
          break;

        case 4: // Braking backwards ---------------------------------------------------------------------
          this.escIsBraking = true;
          this.escInReverse = true;
          this.escIsDriving = false;
          if (this.escPulseWidth < this.pulseZero)
            this.escPulseWidth += this.brakeRampRate; // brake with variable deceleration
          if (this.escPulseWidth > this.pulseZero - this.brakeMargin && this.pulse() == 1)
            this.escPulseWidth = this.pulseZero - this.brakeMargin; // Don't go completely back to neutral, if brake applied
          if (this.escPulseWidth > this.pulseZero && this.pulse() == 0)
            this.escPulseWidth = this.pulseZero; // Overflow prevention!

          if (this.pulse() == 0 && this.escPulse() == -1 && !this.neutralGear)
          {
            this.driveState = 3; // Driving backwards
            this.airBrakeTrigger = true;
          }
          if (this.pulse() == 0 && this.escPulse() == 0)
          {
            this.driveState = 0; // standing still
            this.airBrakeTrigger = true;
          }
          break;

        } // End of state machine **********************************************************************************

        // Gain for drive ramp rate, depending on clutchEngagingPoint
        if (this.currentSpeed < this.clutchEngagingPoint)
        {
          if (!this.automatic && !this.doubleClutch)
            this.driveRampGain = 2; // prevent clutch from slipping too much (2)
          else
            this.driveRampGain = 4; // Automatic transmission needs to catch immediately (4)
        }
        else
          this.driveRampGain = 1;

        // removed pulse out

        // Calculate a speed value from the pulsewidth signal (used as base for engine sound RPM while clutch is engaged)
        if (this.escPulseWidth > this.pulseMaxNeutral)
        {
          this.currentSpeed = this.map(this.escPulseWidth, this.pulseMaxNeutral, this.pulseMax, 0, 500);
        }
        else if (this.escPulseWidth < this.pulseMinNeutral)
        {
          this.currentSpeed = this.map(this.escPulseWidth, this.pulseMinNeutral, this.pulseMin, 0, 500);
        }
        else
          this.currentSpeed = 0;
      }
    }
  }

  variablePlaybackTimer()
  {
    let soundVal = 0;

    switch (this.engineState)
    {

    case this.engineStateOFF:   // Engine off -----------------------
      this.variableTimerTicks = 4000000 / this.startSampleRate;           // our fixed sampling rate

      if (this.engineOn)
      {
        this.engineState = this.engineStateSTARTING;
        this.engineStart = true;
      }
      break;

    case this.engineStateSTARTING: // Engine start ----------------------
      this.variableTimerTicks = 4000000 / this.startSampleRate;           // our fixed sampling rate

      if (this.curStartSample < this.startSampleCount - 1)
      {
        if (this.STEAM_LOCOMOTIVE_MODE) {
          soundVal += (this.startSamples[this.curStartSample] * this.startVolumePercentage / 100);
        } else {
          soundVal += (this.startSamples[this.curStartSample] * this.throttleDependentVolume / 100 * this.startVolumePercentage / 100);
        } 
        this.curStartSample++;
      }
      else
      {
        this.curStartSample = 0;
        this.engineState = this.engineStateRUNNING;
        this.engineStart = false;
        this.engineRunning = true;
        this.airBrakeTrigger = true;
      }
      break;

    case this.engineStateRUNNING: // Engine running ------------------------------------------------------------------
    {

      // different sounds that are mixed together
      let idleVal  = 0;
      let revVal   = 0;
      let brakeVal = 0;

      // Engine idle & revving sounds (mixed together according to engine rpm, new in v5.0)
      this.variableTimerTicks = this.engineSampleRate;                    // our variable idle sampling rate!

      if (!this.engineJakeBraking && !this.blowoffTrigger)
      {
        if (this.curEngineSample < this.sampleCount - 1)
        {
          idleVal = (this.samples[this.curEngineSample] * this.throttleDependentVolume / 100 * this.idleVolumePercentage / 100); // Idle sound
          this.curEngineSample++;

          // Optional rev sound, recorded at medium rpm. Note, that it needs to represent the same number of ignition cycles as the
          // idle sound. For example 4 or 8 for a V8 engine. It also needs to have about the same length. In order to adjust the length
          // or "revSampleCount", change the "Rate" setting in Audacity until it is about the same.
          if (this.REV_SOUND) {
            revVal = (this.revSamples[this.curRevSample] * this.throttleDependentRevVolume / 100 * this.revVolumePercentage / 100); // Rev sound
            if (this.curRevSample < this.revSampleCount)
              this.curRevSample++;
          }

          // Trigger throttle dependent Diesel ignition "knock" sound (played in the fixed sample rate interrupt)
          if (this.curEngineSample - this.lastDieselKnockSample > (this.sampleCount / this.dieselKnockInterval))
          {
            this.dieselKnockTrigger = true;
            this.dieselKnockTriggerFirst = false;
            this.lastDieselKnockSample = this.curEngineSample;
          }
        }
        else
        {
          this.curEngineSample = 0;
          if (this.jakeBrakeRequest)
            this.engineJakeBraking = true;
          if (this.REV_SOUND) {
            this.curRevSample = 0;
          }
          this.lastDieselKnockSample = 0;
          this.dieselKnockTrigger = true;
          this.dieselKnockTriggerFirst = true;
        }
        this.curJakeBrakeSample = 0;
      }
      else
      { // Jake brake sound ----
        if (this.JAKE_BRAKE_SOUND) {
          brakeVal = (this.jakeBrakeSamples[this.curJakeBrakeSample] * this.rpmDependentJakeBrakeVolume / 100 * this.jakeBrakeVolumePercentage / 100); // Jake brake sound
          if (this.curJakeBrakeSample < this.jakeBrakeSampleCount - 1)
            this.curJakeBrakeSample++;
          else
          {
            this.curJakeBrakeSample = 0;
            if (!this.jakeBrakeRequest)
              this.engineJakeBraking = false;
          }

          this.curEngineSample = 0;
          this.curRevSample = 0;
        }
      }

      // Engine sound mixer ----
      if (this.REV_SOUND) {
        // Mixing the idle and rev sounds together, according to engine rpm
        // Below the "revSwitchPoint" target, the idle volume precentage is 90%, then falling to 0% @ max. rpm.
        // The total of idle and rev volume percentage is always 100%

        let mixer;
        if (this.currentRpm > this.revSwitchPoint)
          mixer = this.map(this.currentRpm, this.idleEndPoint, this.revSwitchPoint, 0, this.idleVolumeProportionPercentage);
        else
          mixer = this.idleVolumeProportionPercentage; // 90 - 100% proportion
        if (this.currentRpm > this.idleEndPoint)
          mixer = 0;

        idleVal = (idleVal * mixer) / 100;         // Idle volume
        revVal  = (revVal  * (100 - mixer)) / 100; // Rev volume
      }

      soundVal += idleVal + revVal + brakeVal;

      // Turbo sound ----------------------------------
      if (this.curTurboSample >= this.turboSampleCount)
      {
        this.curTurboSample = 0;
      }
      soundVal += (this.turboSamples[this.curTurboSample] * this.throttleDependentTurboVolume / 100 * this.turboVolumePercentage / 100);
      this.curTurboSample++;

      // Fan sound / gearbox whining --------------------
      if (!this.GEARBOX_WHINING || !this.neutralGear) {
        // used for gearbox whining simulation, so not active in gearbox neutral
        if (this.curFanSample >= this.fanSampleCount)
        {
          this.curFanSample = 0;
        }
        soundVal += (this.fanSamples[this.curFanSample] * this.throttleDependentFanVolume / 100 * this.fanVolumePercentage / 100);
        this.curFanSample++;
      }

      // Supercharger sound --------------------------
      if (this.curChargerSample >= this.chargerSampleCount)
      {
        this.curChargerSample = 0;
      }
      soundVal += (this.chargerSamples[this.curChargerSample] * this.throttleDependentChargerVolume / 100 * this.chargerVolumePercentage / 100);
      this.curChargerSample++;

      // Hydraulic pump sound -----------------------
      if (this.EXCAVATOR_MODE) {
        if (this.curHydraulicPumpSample >= this.hydraulicPumpSampleCount)
        {
          this.curHydraulicPumpSample = 0;
        }
        soundVal += (this.hydraulicPumpSamples[this.curHydraulicPumpSample] * this.hydraulicPumpVolumePercentage / 100 * this.hydraulicPumpVolume / 100);
        this.curHydraulicPumpSample++;
      }

      if (this.STEAM_LOCOMOTIVE_MODE) {
        // Track rattle sound -----------------------
        if (this.curTrackRattleSample < this.trackRattleSampleCount - 1)
        {
          this.curTrackRattleSample = 0;
        }
        soundVal += (this.trackRattleSamples[this.curTrackRattleSample] * this.trackRattleVolumePercentage / 100 * this.trackRattleVolume / 100);
        this.curTrackRattleSample++;
      }

      if (!this.engineOn)
      {
        this.speedPercentage = 100;
        this.attenuator = 1;
        this.engineState = this.engineStateSTOPPING;
        this.engineStop = true;
        this.engineRunning = false;
      }
      break;

    }
    case this.engineStateSTOPPING:  // Engine stop ---------------
      this.variableTimerTicks = 4000000 / this.sampleRate * this.speedPercentage / 100; // our fixed sampling rate

      if (this.curEngineSample >= this.sampleCount - 1)
      {
        this.curEngineSample = 0;
      }
      soundVal += (this.samples[this.curEngineSample] * this.throttleDependentVolume / 100 * this.idleVolumePercentage / 100 / this.attenuator);
      this.curEngineSample++;

      // fade engine sound out
      if (this.millis() - this.attenuatorMillis > 100)
      { // Every 50ms
        this.attenuatorMillis = this.millis();
        this.attenuator++;          // attenuate volume
        this.speedPercentage += 20; // make it slower (10)
      }

      if (this.attenuator >= 50 || this.speedPercentage >= 500)
      { // 50 & 500
        this.speedPercentage = 100;
        this.parkingBrakeTrigger = true;
        this.engineState = this.engineStatePARKING_BRAKE;
        this.engineStop = false;
      }
      break;

    case this.engineStatePARKING_BRAKE: // parking brake bleeding air sound after engine is off ----------------------------

      if (!this.parkingBrakeTrigger)
      {
        this.engineState = this.engineStateOFF;
      }
      break;

    } // end of switch case


    let value = this.constrain(soundVal * this.masterVolume / 100 + this.dacOffset, 0, 255);
  }

  void IRAM_ATTR fixedPlaybackTimer()
  {

    // coreId = xPortGetCoreID(); // Running on core 1

    static uint32_t curHornSample = 0;                            // Index of currently loaded horn sample
    static uint32_t curSirenSample = 0;                           // Index of currently loaded siren sample
    static uint32_t curSound1Sample = 0;                          // Index of currently loaded sound1 sample
    static uint32_t curReversingSample = 0;                       // Index of currently loaded reversing beep sample
    static uint32_t curIndicatorSample = 0;                       // Index of currently loaded indicator tick sample
    static uint32_t curWastegateSample = 0;                       // Index of currently loaded wastegate sample
    static uint32_t curBrakeSample = 0;                           // Index of currently loaded brake sound sample
    static uint32_t curParkingBrakeSample = 0;                    // Index of currently loaded brake sound sample
    static uint32_t curShiftingSample = 0;                        // Index of currently loaded shifting sample
    static uint32_t curDieselKnockSample = 0;                     // Index of currently loaded Diesel knock sample
    static uint32_t curCouplingSample = 0;                        // Index of currently loaded trailer coupling sample
    static uint32_t curUncouplingSample = 0;                      // Index of currently loaded trailer uncoupling sample
    static uint32_t curHydraulicFlowSample = 0;                   // Index of currently loaded hydraulic flow sample
    static uint32_t curTrackRattleSample = 0;                     // Index of currently loaded track rattle sample
    static uint32_t curBucketRattleSample = 0;                    // Index of currently loaded bucket rattle sample
    static uint32_t curTireSquealSample = 0;                      // Index of currently loaded tire squeal sample
    static uint32_t curOutOfFuelSample = 0;                       // Index of currently loaded out of fuel sample
    static boolean knockSilent = 0;                               // This knock will be more silent
    static boolean knockMedium = 0;                               // This knock will be medium
    static uint8_t curKnockCylinder = 0;                          // Index of currently ignited zylinder

    // portENTER_CRITICAL_ISR(&fixedTimerMux);

    int32_t soundVal = 0;

    // horn *************************************************
    if (curHornSample >= hornSampleCount)
    { // End of sample
      curHornSample = 0;
      hornLatch = false;
    }
    if (hornTrigger || hornLatch)
    {
      soundVal += (hornSamples[curHornSample] * hornVolumePercentage / 100);
      curHornSample++;
  #ifdef HORN_LOOP // Optional "endless loop" (points to be defined manually in horn file)
        if (hornTrigger && curHornSample == hornLoopEnd)
          curHornSample = hornLoopBegin; // Loop, if trigger still present
  #endif
    }

    // siren *************************************************
    if (curSirenSample >= sirenSampleCount)
    { // End of sample
      curSirenSample = 0;
      sirenLatch = false;
    }
    if (sirenTrigger || sirenLatch)
    {
  #if defined SIREN_STOP
      if (!sirenTrigger)
      {
        curSirenSample = 0;
        sirenLatch = false;
      }
  #endif

      soundVal += (sirenSamples[curSirenSample] * sirenVolumePercentage / 100);
      curSirenSample++;
  #ifdef SIREN_LOOP // Optional "endless loop" (points to be defined manually in siren file)
      if (sirenTrigger && curSirenSample == sirenLoopEnd)
        curSirenSample = sirenLoopBegin; // Loop, if trigger still present
  #endif
    }
    if (curSirenSample > 10 && curSirenSample < 500)
      cannonFlash = true; // Tank cannon flash triggering in TRACKED_MODE
    else
      cannonFlash = false;

    // other sounds *********************************************

    if (curSound1Sample < sound1SampleCount)
    {
      curSound1Sample = 0; // ensure, next sound will start @ first sample
    }
    if (sound1trigger)
    {
      soundVal += (sound1Samples[curSound1Sample] * sound1VolumePercentage / 100);
      curSound1Sample++;
      if (curSound1Sample >= sound1SampleCount)
      {
        sound1trigger = false;
        curSound1Sample = 0; // ensure, next sound will start @ first sample
      }
    }

    // Reversing beep sound "b1" ----
    if (curReversingSample >= reversingSampleCount)
    {
      curReversingSample = 0;
    }
    if (engineRunning && escInReverse)
    {
      soundVal += (reversingSamples[curReversingSample] * reversingVolumePercentage / 100);
      curReversingSample++;
    }
    else
    {
      curReversingSample = 0; // ensure, next sound will start @ first sample
    }

    // Indicator tick sound ------------------------------------------
  #if not defined NO_INDICATOR_SOUND
    if (curIndicatorSample >= indicatorSampleCount)
    {
      curIndicatorSample = 0;
    }
    if (indicatorSoundOn)
    {
      soundVal += (indicatorSamples[curIndicatorSample] * indicatorVolumePercentage / 100);
      curIndicatorSample++;
      if (curIndicatorSample >= indicatorSampleCount)
      {
        indicatorSoundOn = false;
        curIndicatorSample = 0; // ensure, next sound will start @ first sample
      }
    }
  #endif

    // Wastegate (blowoff) sound, triggered after rapid throttle drop -----------------------------------
    if (curWastegateSample >= wastegateSampleCount)
    {
      curWastegateSample = 0;
    }
    if (wastegateTrigger)
    {
      soundVal += (wastegateSamples[curWastegateSample] * rpmDependentWastegateVolume / 100 * wastegateVolumePercentage / 100);
      curWastegateSample++;
      if (curWastegateSample >= wastegateSampleCount)
      {
        wastegateTrigger = false;
        curWastegateSample = 0; // ensure, next sound will start @ first sample
      }
    }

    // Air brake release sound, triggered after stop -----------------------------------------------
    if (curBrakeSample >= brakeSampleCount)
    {
      curBrakeSample = 0;
    }
    if (airBrakeTrigger)
    {
      soundVal += (brakeSamples[curBrakeSample] * brakeVolumePercentage / 100);
      curBrakeSample++;
      if (curBrakeSample >= brakeSampleCount)
      {
        airBrakeTrigger = false;
        curBrakeSample = 0; // ensure, next sound will start @ first sample
      }
    }

    // Air parking brake attaching sound, triggered after engine off --------------------------------
    if (curParkingBrakeSample >= parkingBrakeSampleCount)
    {
      curParkingBrakeSample = 0;
    }
    if (parkingBrakeTrigger)
    {
      soundVal += (parkingBrakeSamples[curParkingBrakeSample] * parkingBrakeVolumePercentage / 100);
      curParkingBrakeSample++;
      if (curParkingBrakeSample >= parkingBrakeSampleCount)
      {
        parkingBrakeTrigger = false;
        curParkingBrakeSample = 0; // ensure, next sound will start @ first sample
      }
    }

    // Pneumatic gear shifting sound, triggered while shifting the TAMIYA 3 speed transmission ------
    if (curShiftingSample >= shiftingSampleCount)
    {
      curShiftingSample = 0;
    }
    if (shiftingTrigger && engineRunning && !automatic && !doubleClutch)
    {
      soundVal = (shiftingSamples[curShiftingSample] * shiftingVolumePercentage / 100);
      curShiftingSample++;
      if (curShiftingSample >= shiftingSampleCount)
      {
        shiftingTrigger = false;
        curShiftingSample = 0; // ensure, next sound will start @ first sample
      }
    }

    // Diesel ignition "knock" is played in fixed sample rate section, because we don't want changing pitch! ------
    if (dieselKnockTriggerFirst)
    {
      dieselKnockTriggerFirst = false;
      curKnockCylinder = 0;
    }

    if (dieselKnockTrigger)
    {
      dieselKnockTrigger = false;
      curKnockCylinder++; // Count ignition sequence
      curDieselKnockSample = 0;
    }

  #ifdef V8 // (former ADAPTIVE_KNOCK_VOLUME, rename it in your config file!)
    // Ford or Scania V8 ignition sequence: 1 - 5 - 4 - 2* - 6 - 3 - 7 - 8* (* = louder knock pulses, because 2nd exhaust in same manifold after 90°)
    if (curKnockCylinder == 4 || curKnockCylinder == 8)
      knockSilent = false;
    else
      knockSilent = true;
  #endif

  #ifdef V8_MEDIUM // (former ADAPTIVE_KNOCK_VOLUME, rename it in your config file!)
    // This is EXPERIMENTAL!! TODO
    if (curKnockCylinder == 5 || curKnockCylinder == 1)
      knockMedium = false;
    else
      knockMedium = true;
  #endif

  #ifdef V8_468 // (Chevy 468, containing 16 ignition pulses)
    // 1th, 5th, 9th and 13th are the loudest
    // Ignition sequence: 1 - 8 - 4* - 3 - 6 - 5 - 7* - 2
    if (curKnockCylinder == 1 || curKnockCylinder == 5 || curKnockCylinder == 9 || curKnockCylinder == 13)
      knockSilent = false;
    else
      knockSilent = true;
  #endif

  #ifdef V2
    // V2 engine: 1st and 2nd knock pulses (of 4) will be louder
    if (curKnockCylinder == 1 || curKnockCylinder == 2)
      knockSilent = false;
    else
      knockSilent = true;
  #endif

  #ifdef R6
    // R6 inline 6 engine: 6th knock pulse (of 6) will be louder
    if (curKnockCylinder == 6)
      knockSilent = false;
    else
      knockSilent = true;
  #endif

  #ifdef R6_2
    // R6 inline 6 engine: 6th and 3rd knock pulse (of 6) will be louder
    if (curKnockCylinder == 6 || curKnockCylinder == 3)
      knockSilent = false;
    else
      knockSilent = true;
  #endif

    if (curDieselKnockSample < knockSampleCount)
    {
      // multiplier for volume (we divide by 100 at the end)
      int32_t dieselVolume = dieselKnockVolumePercentage;
      dieselVolume *= throttleDependentKnockVolume;

  #if defined RPM_DEPENDENT_KNOCK // knock volume also depending on engine rpm
      dieselVolume *= rpmDependentKnockVolume;
  #elif defined EXCAVATOR_MODE // knock volume also depending on hydraulic load
      dieselVolume *= hydraulicDependentKnockVolume;
  #else
      dieselVolume *= 100;
  #endif

      // changing knock volume according to engine type and cylinder!
      if (knockSilent && !knockMedium)
        dieselVolume *= dieselKnockAdaptiveVolumePercentage / 100;
      if (knockMedium)
        dieselVolume *= dieselKnockAdaptiveVolumePercentage / 75;

      soundVal += knockSamples[curDieselKnockSample] *
          dieselVolume / (100 * 100);
      curDieselKnockSample++;
    }

  #if not defined EXCAVATOR_MODE
    // Trailer coupling sound, triggered by switch -----------------------------------------------
  #ifdef COUPLING_SOUND
    if (curCouplingSample >= couplingSampleCount)
    {
      curCouplingSample = 0;
    }
    if (couplingTrigger)
    {
      soundVal += (couplingSamples[curCouplingSample] * couplingVolumePercentage / 100);
      curCouplingSample++;
      if (curCouplingSample >= couplingSampleCount)
      {
        couplingTrigger = false;
        curCouplingSample = 0; // ensure, next sound will start @ first sample
      }
    }

    // Trailer uncoupling sound, triggered by switch -----------------------------------------------
    if (curUncouplingSample >= uncouplingSampleCount)
    {
      curUncouplingSample = 0;
    }
    if (uncouplingTrigger)
    {
      soundVal += (uncouplingSamples[curUncouplingSample] * couplingVolumePercentage / 100);
      curUncouplingSample++;
      if (curUncouplingSample >= uncouplingSampleCount)
      {
        uncouplingTrigger = false;
        curUncouplingSample = 0;
      }
    }
  #endif
  #endif

    // excavator sounds **************************************************

  #if defined EXCAVATOR_MODE

    // Hydraulic fluid flow sound -----------------------
    if (curHydraulicFlowSample >= hydraulicFlowSampleCount)
    {
      curHydraulicFlowSample = 0;
    }
    soundVal += (hydraulicFlowSamples[curHydraulicFlowSample] * hydraulicFlowVolumePercentage / 100 * hydraulicFlowVolume / 100);
    curHydraulicFlowSample++;

    // Track rattle sound -----------------------
    if (curTrackRattleSample >= trackRattleSampleCount)
    {
      curTrackRattleSample = 0;
    }
    soundVal += (trackRattleSamples[curTrackRattleSample] * trackRattleVolumePercentage / 100 * trackRattleVolume / 100);
    curTrackRattleSample++;

    // Bucket rattle sound -----------------------
    if (curBucketRattleSample >= bucketRattleSampleCount)
    {
      curBucketRattleSample = 0;
    }
    if (bucketRattleTrigger)
    {
      soundVal += (bucketRattleSamples[curBucketRattleSample] * bucketRattleVolumePercentage / 100);
      curBucketRattleSample++;
      if (curBucketRattleSample >= bucketRattleSampleCount)
      {
        bucketRattleTrigger = false;
        curBucketRattleSample = 0; // ensure, next sound will start @ first sample
      }
    }
  #endif

    // additional sounds *************************************************

  #if defined TIRE_SQUEAL
    // Tire squeal sound -----------------------
    if (curTireSquealSample >= tireSquealSampleCount)
    {
      curTireSquealSample = 0;
    }
    soundVal += (tireSquealSamples[curTireSquealSample] * tireSquealVolumePercentage / 100 * tireSquealVolume / 100);
    curTireSquealSample++;
  #endif

  #if defined BATTERY_PROTECTION
    // Out of fuel sound, triggered by battery voltage -----------------------------------------------
    if (curOutOfFuelSample >= outOfFuelSampleCount)
    {
      curOutOfFuelSample = 0;
    }
    if (outOfFuelMessageTrigger)
    {
      soundVal += (outOfFuelSamples[curOutOfFuelSample] * outOfFuelVolumePercentage / 100);
      curOutOfFuelSample++;
      if (curOutOfFuelSample >= outOfFuelSampleCount)
      {
        outOfFuelMessageTrigger = false;
        curOutOfFuelSample = 0; // ensure, next sound will start @ first sample
      }
    }
  #endif


    uint8_t value = constrain(soundVal * masterVolume / 100 + dacOffset, 0, 255);
    SET_PERI_REG_BITS(RTC_IO_PAD_DAC2_REG, RTC_IO_PDAC2_DAC, value, RTC_IO_PDAC2_DAC_S);

    // portEXIT_CRITICAL_ISR(&fixedTimerMux);
  }

}


