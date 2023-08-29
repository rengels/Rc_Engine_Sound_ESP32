# Architecture documentation for Rc_Engine_Sound

## Introduction

This page gives an overview of the project architecture, loose following the arc42 template.

## Constraints

Currently the project is limited to the ESP32 HW platform.
Other platforms are not supported.

## Context & Scope

The Rc_Engine_Sound project is meant for non safety critical, private hobby projects.
The sounds are controlled via RC.

Inputs:

- RC PWM
- PPM
- SBUS
- IBUS

Outputs:

- Two channel 8 bit Sound output
- PWM light output signals
- ESC output

## Solution strategy

Mainly the idea is to play different sound samples via timer interrupts.
Each one of the DAC outputs is serviced by a timer.
There is one timer with a static timing, currently set to 22'050Hz.
The other timer is variable and used to play RPM dependent motor sounds.

The following table gives an overview about the different sounds and their connection to timers.

| Name | variable/fixed | triggered by | volume |
|------|----------------|--------------|--------|
| engine       | variable | engine running | variable |
| rev          | variable | engine running | variable |
| turbo        | variable | engine running | variable |
| fan          | variable | not neutral gear | variable |
| charger      | variable | engine running | variable |
| start        | variable | engine starting  | fixed |
| hydraulicPump| variable | in EXCAVATOR_MODE | variable |
| trackRattle  | variable | in STEAM_LOCOMOTIVE_MODE | variable |
| horn         | fixed  | channel 4    | fixed  |
| siren        | fixed  | channel 4    | fixed  |
| sound1       | fixed  | channel 6    | fixed  |
| reversing    | fixed  | driving backwards | fixed  |
| indicator    | fixed  | channel 1 or 6 | fixed  |
| wastegate    | fixed  | throttle drop  | rpm  |
| brake        | fixed  | stop           | fixed |
| parkingBrake | fixed  | engine off     | fixed |
| shifting     | fixed  | gear change    | fixed |
| knock        | fixed  | engine running | variable |
| coupling     | fixed  | trailer switch | fixed |
| uncoupling   | fixed  | trailer switch | fixed |
| hydraulicFlow| fixed  | in EXCAVATOR_MODE | variable |
| trackRattle  | fixed  | in EXCAVATOR_MODE | variable |
| bucketRattle | fixed  | EXCAVATOR_MODE and engine running | fixed |
| tireSqueal   | fixed  | TIRE_SQUEAL    | steering angle and speed |
| outOfFuel    | fixed  | battery voltage| fixed |


The following table lists the internal ids for the input channels as used by `pulseWidthRaw`.
The `ppmBuf` is usually mapped to `pulseWidthRaw` via defines (e.g. STEERING) except for pwm inputs.

| Number | description | PWM pin mapping | volume |
|--------|-------------|-----------------|--------|
| 1      | steering                                   | 13 | |
| 2      | gearbox (left throttle in TRACKED_MODE)    | 12 | |
| 3      | throttle (right throttle in TRACKED_MODE)  | 14 | |
| 4      | horn and bluelight / siren                 | 27 | |
| 5      | high / low beam, transmission neutral, jake brake etc. | 35 | |
| 6      | indicators, hazards                        | 34 | |


The following table shows a list of the pins and their functionality.

| Number |  description | define | condition |
|--------|--------------|-----------------|--------|
| 33     |  ESC_OUT_PIN | connect crawler type ESC here. Not supported in TRACKED_MODE ----- | |
| 33     |  RZ7886_PIN1 | RZ7886 motor driver pin 1 (same as ESC_OUT_PIN) | |
| 32     |  RZ7886_PIN2 | RZ7886 motor driver pin 2 (same as BRAKELIGHT_PIN) | |
| 13     | STEERING_PIN | CH1 output for steering servo (bus communication only) | |
| 12     | SHIFTING_PIN | CH2 output for shifting servo (bus communication only) | |
| 14     |    WINCH_PIN | CH3 output for winch servo (bus communication only) | |
| 27     |  COUPLER_PIN | CH4 output for coupler (5th. wheel) servo (bus communication only) | |
| 22     | HEADLIGHT_PIN | Headlights connected to GPIO 22 | WEMOS_D1_MINI_ESP32 |
| 22     | CABLIGHT_PIN  | Cabin lights connected to GPIO 22 | not WEMOS_D1_MINI_ESP32 |
| -1     | CABLIGHT_PIN  | No Cabin lights | WEMOS_D1_MINI_ESP32 |
| 3      | HEADLIGHT_PIN | Headlights connected to GPIO 3 | not WEMOS_D1_MINI_ESP32 |
| 15     |       TAILLIGHT_PIN | Red tail- & brake-lights (combined) | |
| 2      |  INDICATOR_LEFT_PIN | Orange left indicator (turn signal) light | |
| 4      | INDICATOR_RIGHT_PIN | Orange right indicator (turn signal) light | |
| 16     |        FOGLIGHT_PIN | (16 = RX2) Fog lights | |
| 17     | REVERSING_LIGHT_PIN | (TX2) White reversing light | |
| 5      |       ROOFLIGHT_PIN | Roof lights (high beam, if "define SEPARATE_FULL_BEAM") | |
| 18     |       SIDELIGHT_PIN | Side lights (connect roof ligthts here, if "define SEPARATE_FULL_BEAM") | |
| 19     |   BEACON_LIGHT2_PIN | Blue beacons light | |
| 21     |   BEACON_LIGHT1_PIN | Blue beacons light | |
| 0      | RGB_LEDS_PIN | Pin is used for WS2812 LED control | |
| 32     | BRAKELIGHT_PIN | Upper brake lights | THIRD_BRAKELIGHT |
| 32     | COUPLER_SWITCH_PIN | switch for trailer coupler sound | not THIRD_BRAKELIGHT |
| 23     | SHAKER_MOTOR_PIN | Shaker motor (shaking truck while idling and engine start / stop) | |
| 25     | DAC1 | connect pin25 (do not change the pin) to a 10kOhm resistor | |
| 26     | DAC2 | connect pin26 (do not change the pin) to a 10kOhm resistor | |


## Building block view

```mermaid
classDiagram

    setup -> varibleTimer : starts
    setup -> fixedTimer : starts

    class setup{
    }
    class variableTimer{
    }
    class fixedTimer{
    }
```

## Runtime view

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

## Deployment View

Just deploy via Visual Studio Code or Arduino IDE.

## Crosscutting Concepts

## Architectural Decisions

## Quality Requirements

Since this is a hobby project we don't have a lot of quality requirements.
It should work.

## Risks & Technical Debt

### Timing

The whole system depends heavily on the timing.
The three interrupts (variable sound, fixed sound, pwm) have to stay below 100% processor load.
However the variable sound time depends on configuration and can (with an incorrect configuration) produce too much load.
This is currently not checked.

## Glossary



