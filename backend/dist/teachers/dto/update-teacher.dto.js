"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTeacherDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UpdateTeacherDto {
}
exports.UpdateTeacherDto = UpdateTeacherDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, { message: 'Bio must be at least 10 characters long' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Bio must not exceed 1000 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateTeacherDto.prototype, "bio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Subjects must be an array' }),
    (0, class_validator_1.ArrayMaxSize)(10, { message: 'Maximum 10 subjects allowed' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each subject must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => Array.isArray(value)
        ? value.map(subject => subject?.trim()).filter(Boolean)
        : []),
    __metadata("design:type", Array)
], UpdateTeacherDto.prototype, "subjects", void 0);
//# sourceMappingURL=update-teacher.dto.js.map