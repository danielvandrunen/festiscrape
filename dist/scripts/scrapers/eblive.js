"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EBLiveScraper = void 0;
var base_scraper_js_1 = require("./base-scraper.js");
var EBLiveScraper = /** @class */ (function (_super) {
    __extends(EBLiveScraper, _super);
    function EBLiveScraper() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.baseUrl = 'https://www.eblive.nl/festivals/';
        return _this;
    }
    EBLiveScraper.prototype.parseFestivals = function ($) {
        return __awaiter(this, void 0, void 0, function () {
            var festivals, monthMap;
            var _this = this;
            return __generator(this, function (_a) {
                festivals = [];
                console.log('Parsing festivals from EBLive...');
                monthMap = {
                    'januari': 0, 'jan': 0,
                    'februari': 1, 'feb': 1,
                    'maart': 2, 'mrt': 2,
                    'april': 3, 'apr': 3,
                    'mei': 4,
                    'juni': 5, 'jun': 5,
                    'juli': 6, 'jul': 6,
                    'augustus': 7, 'aug': 7,
                    'september': 8, 'sep': 8,
                    'oktober': 9, 'okt': 9,
                    'november': 10, 'nov': 10,
                    'december': 11, 'dec': 11
                };
                $('.festival').each(function (_, element) {
                    try {
                        var name_1 = $(element).find('.festival-name a').text().trim();
                        var dateText = $(element).find('.festival-date span').text().trim();
                        var location_1 = $(element).find('.festival-location span').text().trim();
                        var website = $(element).find('.festival-name a').attr('href') || '';
                        // Parse date text with more flexible regex
                        var dateMatch = dateText.match(/(\d{1,2})(?:\s*-\s*\d{1,2})?\s+([a-z]+)(?:\s+(\d{4}))?/i);
                        if (dateMatch) {
                            var day = parseInt(dateMatch[1]);
                            var monthStr = dateMatch[2].toLowerCase();
                            var yearStr = dateMatch[3];
                            var year = yearStr ? parseInt(yearStr) : new Date().getFullYear();
                            var month = monthMap[monthStr];
                            if (month !== undefined) {
                                var date = new Date(year, month, day);
                                // If the date is in the past and we're in the latter part of the year,
                                // assume it's for next year
                                if (!yearStr && date < new Date() && new Date().getMonth() > 8) {
                                    date.setFullYear(year + 1);
                                }
                                // Only add future festivals
                                if (date >= new Date()) {
                                    console.log("Found festival: ".concat(name_1, " on ").concat(date.toISOString()));
                                    festivals.push({
                                        id: _this.generateId(),
                                        name: name_1,
                                        date: date,
                                        website: website,
                                        locations: [location_1],
                                        source: 'eblive',
                                        status: 'active',
                                        is_interested: false,
                                        last_updated: new Date()
                                    });
                                }
                                else {
                                    console.warn("Skipping past festival: ".concat(name_1, " on ").concat(date.toISOString()));
                                }
                            }
                            else {
                                console.warn("Could not parse month for ".concat(name_1, ": '").concat(monthStr, "'"));
                            }
                        }
                        else {
                            console.warn("Could not parse date for ".concat(name_1, ": '").concat(dateText, "'"));
                        }
                    }
                    catch (error) {
                        console.error('Error parsing festival:', error);
                    }
                });
                return [2 /*return*/, festivals];
            });
        });
    };
    return EBLiveScraper;
}(base_scraper_js_1.BaseScraper));
exports.EBLiveScraper = EBLiveScraper;
