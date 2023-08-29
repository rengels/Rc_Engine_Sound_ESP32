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



