"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationPipe = void 0;
const common_1 = require("@nestjs/common");
class ValidationPipe extends common_1.ValidationPipe {
    constructor() {
        super({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            exceptionFactory: (errors) => {
                const messages = this.flattenErrors(errors);
                return new common_1.BadRequestException({
                    message: 'Validation failed',
                    errors: messages,
                });
            },
        });
    }
    flattenErrors(errors) {
        const messages = [];
        for (const error of errors) {
            if (error.constraints) {
                messages.push(...Object.values(error.constraints));
            }
            if (error.children && error.children.length > 0) {
                messages.push(...this.flattenErrors(error.children));
            }
        }
        return messages;
    }
}
exports.ValidationPipe = ValidationPipe;
//# sourceMappingURL=validation.pipe.js.map