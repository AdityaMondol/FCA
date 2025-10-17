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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachersController = void 0;
const common_1 = require("@nestjs/common");
const teachers_service_1 = require("./teachers.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const teacher_application_dto_1 = require("./dto/teacher-application.dto");
const update_teacher_dto_1 = require("./dto/update-teacher.dto");
let TeachersController = class TeachersController {
    constructor(teachersService) {
        this.teachersService = teachersService;
    }
    async getAllVerifiedTeachers() {
        return this.teachersService.getAllVerifiedTeachers();
    }
    async getMyTeacherProfile(req) {
        return this.teachersService.getTeacherByProfileId(req.user.profileId);
    }
    async applyAsTeacher(req, applicationDto) {
        return this.teachersService.applyAsTeacher(req.user.profileId, applicationDto);
    }
    async updateTeacherProfile(req, updateDto) {
        return this.teachersService.updateTeacherProfile(req.user.profileId, updateDto);
    }
    async getPendingTeachers() {
        return this.teachersService.getPendingTeachers();
    }
    async verifyTeacher(teacherId, req) {
        return this.teachersService.verifyTeacher(teacherId, req.user.profileId);
    }
    async getTeacherById(teacherId) {
        const teachers = await this.teachersService.getAllVerifiedTeachers();
        const teacher = teachers.find(t => t.id === teacherId);
        if (!teacher) {
            throw new Error('Teacher not found or not verified');
        }
        return teacher;
    }
};
exports.TeachersController = TeachersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getAllVerifiedTeachers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getMyTeacherProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)(['teacher']),
    (0, common_1.Post)('apply'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, teacher_application_dto_1.TeacherApplicationDto]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "applyAsTeacher", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)(['teacher']),
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_teacher_dto_1.UpdateTeacherDto]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "updateTeacherProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)(['admin']),
    (0, common_1.Get)('pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getPendingTeachers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)(['admin']),
    (0, common_1.Put)(':id/verify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "verifyTeacher", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getTeacherById", null);
exports.TeachersController = TeachersController = __decorate([
    (0, common_1.Controller)('teachers'),
    __metadata("design:paramtypes", [teachers_service_1.TeachersService])
], TeachersController);
//# sourceMappingURL=teachers.controller.js.map