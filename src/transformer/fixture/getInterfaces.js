"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reflector_1 = require("../../reflector/reflector");
const classes_1 = require("./classes");
const forInterface = reflector_1.getInterfaces({ value: 'foo' });
const forComponent = reflector_1.getComponentInterfaces(classes_1.XClass);
