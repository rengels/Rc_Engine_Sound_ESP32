#include <Arduino.h>

// Lamborghini Huracan Evo
// note: The sound is really different depending on your position
// around the car (e.g. exaust) and the mode (e.g. corsa mode)
//
// So this is kind of generic

// Sound files (22'050 Hz, 8 bit PCM recommended) -----------------------------------------------------------------------
// Choose the start sound (uncomment the one you want) --------
const int32_t startVolumePercentage = 100;
#include "sounds/HuracanStart4.h"

// Choose the motor idle sound (uncomment the one you want) --------
const int32_t idleVolumePercentage = 100;
const int32_t engineIdleVolumePercentage = 5;
const int32_t fullThrottleVolumePercentage = 100;
#include "sounds/HuracanIdle4.h"

// Choose the motor revving sound (uncomment the one you want) --------
// #define REV_SOUND // uncomment this, if you want to use the separate, optional rev sound
const int32_t revVolumePercentage = 100; // Adjust the idle volume (usually = 100%, more also working, depending on sound)
const int32_t engineRevVolumePercentage = 60; // the engine volume will be throttle dependent (usually = 40%, never more than 100%!)
const uint16_t revSwitchPoint = 50; // The rev sound is played instead of the idle sound above this point
const uint16_t idleEndPoint = 300; // above this point, we have 100% rev and 0% idle sound volume (usually 500, min. 50 more than revSwitchPoint)
const uint16_t idleVolumeProportionPercentage = 100; // The idle sound volume proportion (rest is rev proportion) below "revSwitchPoint" (about 90 - 100%, never more than 100)
#ifdef REV_SOUND
#include "sounds/HuracanRev3.h"
#endif

// Choose the jake brake sound (uncomment the one you want) --------
//#define JAKE_BRAKE_SOUND
const int32_t jakeBrakeVolumePercentage = 0;
const int32_t jakeBrakeIdleVolumePercentage = 0;
const int32_t jakeBrakeMinRpm = 200;
#ifdef JAKE_BRAKE_SOUND
#include "sounds/JakeBrake.h"
#endif

const int32_t dieselKnockVolumePercentage = 0;
const int32_t dieselKnockIdleVolumePercentage = 0;
const int32_t dieselKnockStartPoint = 10;
const int32_t dieselKnockInterval = 12;
#define V8
volatile int dieselKnockAdaptiveVolumePercentage = 50;
// #define RPM_DEPENDENT_KNOCK
#ifdef RPM_DEPENDENT_KNOCK
uint8_t minKnockVolumePercentage = 5;
uint16_t knockStartRpm = 400;
#endif
#include "sounds/LaFerrariKnock.h"

// Lamborghini Huracan Evo doesn't have a turbo or a supercharger
const int32_t turboVolumePercentage = 0;
const int32_t turboIdleVolumePercentage = 0;
#include "sounds/TurboWhistle.h"

const int32_t chargerVolumePercentage = 0;
const int32_t chargerIdleVolumePercentage = 10;
const int32_t chargerStartPoint = 10;
#include "sounds/supercharger.h"

const int32_t wastegateVolumePercentage = 0;
const int32_t wastegateIdleVolumePercentage = 1;
#include "sounds/WastegateDummy.h"

// Adjust the additional cooling fan sound (set "fanVolumePercentage" to "0", if you don't want it) --------
const int32_t fanVolumePercentage = 0; // Adjust the fan volume (50% for Tatra 813, else 0%)
const int32_t fanIdleVolumePercentage = 0; // the fan volume will be engine rpm dependent (usually = 10%)
const int32_t fanStartPoint = 0; // Volume will raise above this point (250 for Tatra 813)
#include "sounds/GenericFan.h" // Generic engine cooling fan

// Choose the horn sound (uncomment the one you want) --------
const int32_t hornVolumePercentage = 60; // Adjust the horn volume (usually = 100%)
#include "sounds/CarHorn.h" // A boring car horn

// Choose the siren / additional horn sound (uncomment the one you want) --------
#define NO_SIREN
const int32_t sirenVolumePercentage = 100; // Adjust the siren volume (usually = 100%)
#include "sounds/sirenDummy.h" // If you don't want siren sound

const int32_t brakeVolumePercentage = 0;
#include "sounds/AirBrakeDummy.h"

const int32_t parkingBrakeVolumePercentage = 0;
#include "sounds/ParkingBrakeDummy.h"

volatile int shiftingVolumePercentage = 00;
#include "sounds/AirShiftingDummy.h" // If you don't want pneumatic shifting sound
//#include "sounds/AirShifting.h" // Pneumatic shifting sound
// #include "sounds/ClunkingGearShifting.h" // Manual clunking shifting sound

// Choose the additional "sound1" (uncomment the one you want) --------
volatile int sound1VolumePercentage = 100; // Adjust the sound1 volume (usually = 100%)
//#include "sounds/EMDLocomotiveBell.h" // American EMD locomotive bell
//#include "sounds/007JamesBond.h" // James Bond melody
//#include "sounds/M2Fire.h" // M2 salve
//#include "sounds/GlenCanyon.h" // Glen Canyon country song for truckers ;-)
#include "sounds/door.h" // opening and closing the door

volatile int reversingVolumePercentage = 0;
#include "sounds/TruckReversingBeep.h"

// Choose the indicator / turn signal options --------
volatile int indicatorVolumePercentage = 10;
const uint16_t indicatorOn = 300;
const boolean INDICATOR_DIR = true;
#include "sounds/Indicator.h"

#define TIRE_SQUEAL
volatile int tireSquealVolumePercentage = 100;
#include "sounds/TireSqueal2.h"

#define SEPARATE_FULL_BEAM // separate full beam bulb, wired to "rooflight" pin ----

// Choose the light options --------
#define XENON_LIGHTS // Headlights will show a xenon bulb ignition flash, if defined

// Choose the blue light options -----------------------------------------------------------------------------------------
const boolean doubleFlashBlueLight = true; // double flash blue lights if "true", "rotating" beacons if "false"

// Acceleration & deceleration settings ----------------------------------------------------------------------------------
const uint8_t escRampTimeFirstGear = 20; // determines, how fast the acceleration and deceleration happens (about 15 - 25, 20 for King Hauler)
const uint8_t escRampTimeSecondGear = 30; // 50 for King Hauler (this value is always in use for automatic transmission, about 80)
const uint8_t escRampTimeThirdGear = 40; // 75 for King Hauler
const uint8_t escBrakeSteps = 50; // determines, how fast the ESC is able to brake down (20 - 30, 30 for King Hauler)
const uint8_t escAccelerationSteps = 5; // determines, how fast the ESC is able to accelerate (2 - 3, 3 for King Hauler)

// Gearbox parameters ---------------------------------------------------------------------------------------------------
const boolean automatic = true; // false = linear rpm curve, true = automatic transmission with torque converter is simulated (use it, if you don't have a real shifting transmission)
#define NumberOfAutomaticGears 6 // <<------- Select 3, 4 or 6 gears!
const boolean doubleClutch = true; // do not activate it at the same time as automatic!
const boolean shiftingAutoThrottle = true; // For Tamiya 3 speed tansmission, throttle is altered for synchronizing, if "true"

// Clutch parameters ---------------------------------------------------------------------------------------------------
uint16_t clutchEngagingPoint = 100; // CEP. The "clutch" is engaging above this point = engine rpm sound in synch with ESC power

// Engine parameters ----------------------------------------------------------------------------------------------------
// Engine max. RPM in % of idle RPM. About 200% for big Diesels, 390% for fast running motors.
uint32_t MAX_RPM_PERCENTAGE = 350; // NOTE! Was called TOP_SPEED_MULTIPLIER (TSM) in earlier versions and was a multiplier instead of a percentage!

// Engine mass simulation
const int8_t acc = 2; // Acceleration step (2) 1 = slow for locomotive engine, 9 = fast for trophy truck. Always 2 for automatic transmission!
const int8_t dec = 10; // Deceleration step (1) 1 = slow for locomotive engine, 5 = fast for trophy truck

