"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoModel = void 0;
exports.InfoModel = {
    async create(data) {
        return {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...data,
        };
    },
    async getAll() {
        return [];
    },
};
