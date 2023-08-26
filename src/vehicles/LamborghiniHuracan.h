#include <Arduino.h>

// Vehicle specific settings for sound, lights, ESC, transmission. This is a vehicle specific file.
// Should emulate the sound of a Lamborghini Huracan Evo

// Sound files (22'050 Hz, 8 bit PCM recommended) -----------------------------------------------------------------------
// Choose the start sound (uncomment the one you want) --------
volatile int startVolumePercentage = 120; // Adjust the start volume (usually = 80%)
#include "sounds/LaFerrariStart.h" // Ferrari LaFerrari, V12

// Choose the motor idle sound (uncomment the one you want) --------
volatile int idleVolumePercentage = 64; // Adjust the idle volume (usually = 80%, more also working, depending on sound, 40 - 48% if additional diesel knock sound is used)
volatile int engineIdleVolumePercentage = 60; // the engine volume will be throttle dependent (usually = 40%, never more than 100%!)
volatile int fullThrottleVolumePercentage = 130; // Volume Percentage while full throttle (for rev sound as well)
#include "sounds/LaFerrariIdle.h" // Jaguar XJS V12
//#include "sounds/idleDummy.h" // Dummy

// Choose the motor revving sound (uncomment the one you want) --------
#define REV_SOUND // uncomment this, if you want to use the separate, optional rev sound
volatile int revVolumePercentage = 96; // Adjust the idle volume (usually = 80%, more also working, depending on sound)
volatile int engineRevVolumePercentage = 60; // the engine volume will be throttle dependent (usually = 40%, never more than 100%!)
volatile const uint16_t revSwitchPoint = 50; // The rev sound is played instead of the idle sound above this point
volatile const uint16_t idleEndPoint = 300; // above this point, we have 100% rev and 0% idle sound volume (usually 500, min. 50 more than revSwitchPoint)
volatile const uint16_t idleVolumeProportionPercentage = 100; // The idle sound volume proportion (rest is rev proportion) below "revSwitchPoint" (about 90 - 100%, never more than 100)
#ifdef REV_SOUND
#include "sounds/LaFerrariRev.h" // Ferrari LaFerrari, V12
#endif

// Choose the jake brake sound (uncomment the one you want) --------
//#define JAKE_BRAKE_SOUND // uncomment this, if you want to use the jake brake sound
volatile int jakeBrakeVolumePercentage = 140; // Adjust the max. volume (usually = 150%)
volatile int jakeBrakeIdleVolumePercentage = 0; // Adjust the min. volume (usually = 80%)
volatile int jakeBrakeMinRpm = 200; // Adjust the min. RPM for the jake brake (around 100)
#ifdef JAKE_BRAKE_SOUND
#include "sounds/JakeBrake.h" // CAT V8 Jake Brake sound
#endif

// Choose the Diesel (or whatever) ignition "knock" sound (played in the fixed sampling rate interrupt, uncomment the one you want,
// play around here, the results are amazing, if you hit the right combination with the idle sound!) --------
volatile int dieselKnockVolumePercentage = 120; // Adjust the Diesel knock volume (usually = 40 - 120%) 140
volatile int dieselKnockIdleVolumePercentage = 0; // Diesel knock volume while no throttle is applied (usually = 20%)
volatile int dieselKnockStartPoint = 10; // Volume will raise above this throttle input( usually 0, for "open pipe" exhaust about 250)
volatile int dieselKnockInterval = 12; // Idle sample length divided by this number (1 - 20, depending on sound files)
#define V8 // V8 engine (Ford, Scania): pulses 4 and 8 will bel louder, because only 90° gap between exhaust cycles in same manifold
//#define V2 // V2 engine (Harley): first 2 of 4 pulses will be louder (set dieselKnockInterval to 4)
volatile int dieselKnockAdaptiveVolumePercentage = 50; // Adjust the Diesel knock volume for the non-first knocks per engine cycle (usually = 50%)
#define RPM_DEPENDENT_KNOCK // Knock volume also depending on engine RPM *****************
#ifdef RPM_DEPENDENT_KNOCK // These parameters are for RPM dependent knock mode only:
uint8_t minKnockVolumePercentage = 5; // percentage, if at knock start RPM (about 5 - 80)
uint16_t knockStartRpm = 400; // starting @ this RPM (about 50 - 400)
#endif // ********************************************************************************
#include "sounds/LaFerrariKnock.h" // Ferrari LaFerrari, V12

// Adjust the additional turbo sound (set "turboVolumePercentage" to "0", if you don't want it) --------
// Lamborghini doesn't have a turbo or a supercharger
volatile int turboVolumePercentage = 0; // Adjust the turbo volume (usually = 14%)
volatile int turboIdleVolumePercentage = 0; // the turbo volume will be engine rpm dependent (usually = 10%)
#include "sounds/TurboWhistle.h" // Turbo sound, playing in parallel with engine sound!

// Adjust the additional supercharger sound (set "chargerVolumePercentage" to "0", if you don't want it) --------
volatile int chargerVolumePercentage = 0; // Adjust the supercharger volume (usually = 14%)
volatile int chargerIdleVolumePercentage = 10; // the supercharger volume will be engine rpm dependent (usually = 10%)
volatile int chargerStartPoint = 10; // Volume will raise above this point ( usually 10)
#include "sounds/supercharger.h" // supercharger sound, playing in parallel with engine sound!

// Adjust the additional turbo wastegate  / blowoff valve  sound (set "wastegateVolumePercentage" to "0", if you don't want it)--------
volatile int wastegateVolumePercentage = 18; // Adjust the wastegate volume (usually = 14%, up to 50%)
volatile int wastegateIdleVolumePercentage = 1; // Wastegate sound is played, after rapid throttle drop with engaged clutch
#include "sounds/WastegateDummy.h"
//#include "sounds/UnimogU1000TurboWastegate.h"
//#include "sounds/ScaniaR730V8TurboWastegate.h"

// Adjust the additional cooling fan sound (set "fanVolumePercentage" to "0", if you don't want it) --------
volatile int fanVolumePercentage = 0; // Adjust the fan volume (50% for Tatra 813, else 0%)
volatile int fanIdleVolumePercentage = 0; // the fan volume will be engine rpm dependent (usually = 10%)
volatile int fanStartPoint = 0; // Volume will raise above this point (250 for Tatra 813)
#include "sounds/GenericFan.h" // Generic engine cooling fan

// Choose the horn sound (uncomment the one you want) --------
volatile int hornVolumePercentage = 80; // Adjust the horn volume (usually = 80%)
#include "sounds/CarHorn.h" // A boring car horn

// Choose the siren / additional horn sound (uncomment the one you want) --------
volatile int sirenVolumePercentage = 80; // Adjust the siren volume (usually = 80%)
#include "sounds/sirenDummy.h" // If you don't want siren sound

// Choose the air brake release sound (uncomment the one you want) --------
volatile int brakeVolumePercentage = 30; // Adjust the brake volume (usually = 40%)
#include "sounds/AirBrakeDummy.h" // If you don't want air brake sound

// Choose the parking brake engaging sound (uncomment the one you want) --------
volatile int parkingBrakeVolumePercentage = 30; // Adjust the brake volume (usually = 40%)
#include "sounds/ParkingBrakeDummy.h" // If you don't want parking brake sound
//#include "sounds/ParkingBrake.h" // Parking brake sound

// Choose the gear shifting sound (uncomment the one you want) --------
volatile int shiftingVolumePercentage = 20; // Adjust the shifting volume (usually = 40%)
//#include "sounds/AirShiftingDummy.h" // If you don't want pneumatic shifting sound
//#include "sounds/AirShifting.h" // Pneumatic shifting sound
#include "sounds/ClunkingGearShifting.h" // Manual clunking shifting sound

// Choose the additional "sound1" (uncomment the one you want) --------
volatile int sound1VolumePercentage = 100; // Adjust the sound1 volume (usually = 100%)
//#include "sounds/EMDLocomotiveBell.h" // American EMD locomotive bell
//#include "sounds/007JamesBond.h" // James Bond melody
//#include "sounds/M2Fire.h" // M2 salve
//#include "sounds/GlenCanyon.h" // Glen Canyon country song for truckers ;-)
#include "sounds/door.h" // opening and closing the door

// Choose the reversing beep sound --------
volatile int reversingVolumePercentage = 0; // Adjust the reversing sound volume (usually = 14%)
#include "sounds/TruckReversingBeep.h" // 1000Hz peep sound

// Choose the indicator / turn signal options --------
volatile int indicatorVolumePercentage = 10; // Adjust the indicator sound volume (usually = 10%)
const uint16_t indicatorOn = 300; // The indicator will be switched on above +/- this value, if wheels are turned
const boolean INDICATOR_DIR = true; // adjust indicator direction with true or false
#include "sounds/Indicator.h" // "Tick-Tack" sound

// Choose the tire squealing sound (uncomment the ones you want) --------
#define TIRE_SQUEAL
volatile int tireSquealVolumePercentage = 160; // Adjust the tire squeal volume
#include "sounds/TireSqueal2.h"

#define SEPARATE_FULL_BEAM // separate full beam bulb, wired to "rooflight" pin ----

// Choose the light options --------
#define XENON_LIGHTS // Headlights will show a xenon bulb ignition flash, if defined

// Choose the blue light options -----------------------------------------------------------------------------------------
const boolean doubleFlashBlueLight = true; // double flash blue lights if "true", "rotating" beacons if "false"

// Acceleration & deceleration settings ----------------------------------------------------------------------------------
const uint8_t escRampTimeFirstGear = 20; // determines, how fast the acceleration and deceleration happens (about 15 - 25, 20 for King Hauler)
const uint8_t escRampTimeSecondGear = 50; // 50 for King Hauler (this value is always in use for automatic transmission, about 80)
const uint8_t escRampTimeThirdGear = 75; // 75 for King Hauler
const uint8_t escBrakeSteps = 30; // determines, how fast the ESC is able to brake down (20 - 30, 30 for King Hauler)
const uint8_t escAccelerationSteps = 3; // determines, how fast the ESC is able to accelerate (2 - 3, 3 for King Hauler)

// Gearbox parameters ---------------------------------------------------------------------------------------------------
const boolean automatic = false; // false = linear rpm curve, true = automatic transmission with torque converter is simulated (use it, if you don't have a real shifting transmission)
#define NumberOfAutomaticGears 6 // <<------- Select 3, 4 or 6 gears!
const boolean doubleClutch = true; // do not activate it at the same time as automatic!
const boolean shiftingAutoThrottle = true; // For Tamiya 3 speed tansmission, throttle is altered for synchronizing, if "true"

// Clutch parameters ---------------------------------------------------------------------------------------------------
uint16_t clutchEngagingPoint = 100; // CEP. The "clutch" is engaging above this point = engine rpm sound in synch with ESC power

// Engine parameters ----------------------------------------------------------------------------------------------------
// Engine max. RPM in % of idle RPM. About 200% for big Diesels, 390% for fast running motors.
uint32_t MAX_RPM_PERCENTAGE = 400; // NOTE! Was called TOP_SPEED_MULTIPLIER (TSM) in earlier versions and was a multiplier instead of a percentage!

// Engine mass simulation
const int8_t acc = 2; // Acceleration step (2) 1 = slow for locomotive engine, 9 = fast for trophy truck. Always 2 for automatic transmission!
const int8_t dec = 1; // Deceleration step (1) 1 = slow for locomotive engine, 5 = fast for trophy truck
