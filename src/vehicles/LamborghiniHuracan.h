#include <Arduino.h>

// Lamborghini Huracan Evo
// note: The sound is really different depending on your position
// around the car (e.g. exaust) and the mode (e.g. corsa mode)
//
// The sound samples are recorded near the exaust in strada mode.

const int32_t startVolumePercentage = 200;
#include "sounds/HuracanStart5.h"

const int32_t idleVolumePercentage = 200;
const int32_t engineIdleVolumePercentage = 25;
const int32_t fullThrottleVolumePercentage = 100;
// #include "sounds/LaFerrariIdle.h" // Jaguar XJS V12
#include "sounds/HuracanIdle5.h"

#define REV_SOUND
const int32_t revVolumePercentage = 100;
const int32_t engineRevVolumePercentage = 60;
const uint16_t revSwitchPoint = 50;
const uint16_t idleEndPoint = 200;
const uint16_t idleVolumeProportionPercentage = 100;
#ifdef REV_SOUND
#include "sounds/HuracanRev5.h"
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
const uint8_t escRampTimeFirstGear = 15; // determines, how fast the acceleration and deceleration happens (about 15 - 25, 20 for King Hauler)
const uint8_t escRampTimeSecondGear = 20; // 50 for King Hauler (this value is always in use for automatic transmission, about 80)
const uint8_t escRampTimeThirdGear = 30; // 75 for King Hauler
const uint8_t escBrakeSteps = 50; // determines, how fast the ESC is able to brake down (20 - 30, 30 for King Hauler)
const uint8_t escAccelerationSteps = 3; // determines, how fast the ESC is able to accelerate (2 - 3, 3 for King Hauler)

// Gearbox parameters ---------------------------------------------------------------------------------------------------
const boolean automatic = true; // false = linear rpm curve, true = automatic transmission with torque converter is simulated (use it, if you don't have a real shifting transmission)
#define NumberOfAutomaticGears 6 // <<------- Select 3, 4 or 6 gears!
const boolean doubleClutch = false; // do not activate it at the same time as automatic!
const boolean shiftingAutoThrottle = false; // For Tamiya 3 speed tansmission, throttle is altered for synchronizing, if "true"

// Clutch parameters ---------------------------------------------------------------------------------------------------
uint16_t clutchEngagingPoint = 100; // CEP. The "clutch" is engaging above this point = engine rpm sound in synch with ESC power

// Engine parameters ----------------------------------------------------------------------------------------------------
// Engine max. RPM in % of idle RPM.
// Huracan idle: 1000 RPM, 8500 RPM is redline (max power output 8250 RPM)
uint32_t MAX_RPM_PERCENTAGE = 350;

// Engine mass simulation
const int8_t acc = 2; // Acceleration step (2) 1 = slow for locomotive engine, 9 = fast for trophy truck. Always 2 for automatic transmission!
const int8_t dec = 5; // Deceleration step (1) 1 = slow for locomotive engine, 5 = fast for trophy truck

