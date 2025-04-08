"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseScraper = void 0;
var uuid_1 = require("uuid");
var axios_1 = __importDefault(require("axios"));
var cheerio = __importStar(require("cheerio"));
var https_1 = __importDefault(require("https"));
var BaseScraper = /** @class */ (function () {
    function BaseScraper() {
    }
    BaseScraper.prototype.generateId = function () {
        return (0, uuid_1.v4)();
    };
    BaseScraper.prototype.fetchPage = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Fetching page: ".concat(url));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get(url, {
                                httpsAgent: new https_1.default.Agent({
                                    rejectUnauthorized: false
                                })
                            })];
                    case 2:
                        response = _a.sent();
                        console.log("Successfully fetched page: ".concat(url));
                        return [2 /*return*/, cheerio.load(response.data)];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Error fetching page ".concat(url, ":"), error_1.message);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BaseScraper.prototype.scrape = function () {
        return __awaiter(this, void 0, void 0, function () {
            var $, festivals, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log("Starting scrape for ".concat(this.constructor.name));
                        return [4 /*yield*/, this.fetchPage(this.baseUrl)];
                    case 1:
                        $ = _a.sent();
                        return [4 /*yield*/, this.parseFestivals($)];
                    case 2:
                        festivals = _a.sent();
                        console.log("Found ".concat(festivals.length, " festivals from ").concat(this.constructor.name));
                        // Add metadata to each festival
                        return [2 /*return*/, festivals.map(function (festival) { return (__assign(__assign({}, festival), { last_updated: new Date(), status: 'active', is_interested: false })); })];
                    case 3:
                        error_2 = _a.sent();
                        console.error("Error in ".concat(this.constructor.name, ":"), error_2.message);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BaseScraper.prototype.parseDutchDate = function (dateStr) {
        // Convert Dutch month names to English
        var dutchToEnglish = {
            'jan': 'January', 'feb': 'February', 'mrt': 'March', 'apr': 'April',
            'mei': 'May', 'jun': 'June', 'jul': 'July', 'aug': 'August',
            'sep': 'September', 'okt': 'October', 'nov': 'November', 'dec': 'December',
            'januari': 'January', 'februari': 'February', 'maart': 'March', 'april': 'April',
            'juni': 'June', 'juli': 'July', 'augustus': 'August', 'september': 'September',
            'oktober': 'October', 'november': 'November', 'december': 'December'
        };
        try {
            // Remove day names
            dateStr = dateStr.replace(/\b(?:ma|di|wo|do|vr|za|zo|maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag)\b/gi, '');
            // Handle date ranges (take the first date)
            dateStr = dateStr.split(/\s*(?:t\/m|-)\s*/)[0];
            // Try multiple date formats
            var patterns = [
                // Format: "21 juni 2024" or "21 juni"
                /(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?/i,
                // Format: "21-06-2024"
                /(\d{1,2})-(\d{1,2})-(\d{4})/,
                // Format: "21.06.2024"
                /(\d{1,2})\.(\d{1,2})\.(\d{4})/
            ];
            for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
                var pattern = patterns_1[_i];
                var match = dateStr.match(pattern);
                if (match) {
                    var day = void 0, month = void 0, year = void 0;
                    if (pattern === patterns[0]) {
                        // Text month format
                        day = parseInt(match[1], 10);
                        var dutchMonth = match[2].toLowerCase();
                        var englishMonth = dutchToEnglish[dutchMonth] || dutchMonth;
                        month = new Date("".concat(englishMonth, " 1, 2000")).getMonth();
                        year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();
                    }
                    else {
                        // Numeric format
                        day = parseInt(match[1], 10);
                        month = parseInt(match[2], 10) - 1;
                        year = parseInt(match[3], 10);
                    }
                    var date = new Date(year, month, day);
                    // Validate date
                    if (!isNaN(date.getTime()) && date >= new Date()) {
                        return date;
                    }
                }
            }
        }
        catch (e) {
            console.error('Error parsing date:', dateStr, e);
        }
        return undefined;
    };
    return BaseScraper;
}());
exports.BaseScraper = BaseScraper;
