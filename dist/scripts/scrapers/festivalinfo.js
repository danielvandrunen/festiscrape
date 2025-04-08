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
exports.FestivalInfoScraper = void 0;
var base_scraper_js_1 = require("./base-scraper.js");
var FestivalInfoScraper = /** @class */ (function (_super) {
    __extends(FestivalInfoScraper, _super);
    function FestivalInfoScraper() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.baseUrl = 'https://www.festivalinfo.nl/festivals/';
        return _this;
    }
    FestivalInfoScraper.prototype.parseFestivals = function ($) {
        return __awaiter(this, void 0, void 0, function () {
            var festivals, yearMatch, currentYear;
            var _this = this;
            return __generator(this, function (_a) {
                festivals = [];
                console.log('Parsing FestivalInfo page...');
                yearMatch = $.html().match(/\b(202\d)\b/);
                currentYear = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
                $('.festival_rows_info').each(function (index, element) {
                    try {
                        var $element = $(element);
                        var name_1 = $element.find('strong a').text().trim();
                        var website = $element.find('strong a').attr('href') || '';
                        var location_1 = $element.find('.eightcol span').first().text().replace(/,.*$/, '').trim();
                        // Broader selector for date section
                        var dateSection = $element.prevAll('.festival_agenda_date').first();
                        var dateText = dateSection.text().trim().replace(/\s+/g, ' '); // Get all text and normalize spaces
                        // Extract day and month using more flexible regex
                        var dateMatch = dateText.match(/(\d{1,2})\s+([A-Za-z]+)(?:\s+(\d{4}))?/i);
                        if (!dateMatch) {
                            console.warn("Could not find date pattern in text for ".concat(name_1, ": '").concat(dateText, "'"));
                            return;
                        }
                        var day = dateMatch[1];
                        var monthText = dateMatch[2];
                        var year = dateMatch[3] ? parseInt(dateMatch[3]) : new Date().getFullYear();
                        var dutchMonths = {
                            'JAN': 0, 'JANUARI': 0,
                            'FEB': 1, 'FEBRUARI': 1,
                            'MRT': 2, 'MAART': 2,
                            'APR': 3, 'APRIL': 3,
                            'MEI': 4,
                            'JUN': 5, 'JUNI': 5,
                            'JUL': 6, 'JULI': 6,
                            'AUG': 7, 'AUGUSTUS': 7,
                            'SEP': 8, 'SEPTEMBER': 8,
                            'OKT': 9, 'OKTOBER': 9,
                            'NOV': 10, 'NOVEMBER': 10,
                            'DEC': 11, 'DECEMBER': 11
                        };
                        var monthIndex = dutchMonths[monthText.toUpperCase()];
                        if (monthIndex === undefined || !day || isNaN(parseInt(day))) {
                            console.warn("Could not parse extracted date components for ".concat(name_1, ": Day='").concat(day, "', Month='").concat(monthText, "'"));
                            return;
                        }
                        var date = new Date(year, monthIndex, parseInt(day));
                        // If the date is in the past and we're in the latter part of the year,
                        // assume it's for next year
                        if (!dateMatch[3] && date < new Date() && new Date().getMonth() > 8) {
                            date.setFullYear(year + 1);
                        }
                        if (isNaN(date.getTime()) || date < new Date()) {
                            // console.log(`Invalid or past date for ${name}: ${date}`);
                            return;
                        }
                        festivals.push({
                            id: _this.generateId(),
                            name: name_1,
                            date: date,
                            website: website.startsWith('http') ? website : "https://www.festivalinfo.nl".concat(website),
                            locations: location_1 ? [location_1] : [],
                            source: 'festivalinfo',
                            status: 'active',
                            is_interested: false,
                            last_updated: new Date()
                        });
                        // console.log('Successfully added festival:', name);
                    }
                    catch (error) {
                        console.error("Error parsing FestivalInfo entry for ".concat($(element).find('strong a').text().trim(), ":"), error);
                    }
                });
                return [2 /*return*/, festivals];
            });
        });
    };
    return FestivalInfoScraper;
}(base_scraper_js_1.BaseScraper));
exports.FestivalInfoScraper = FestivalInfoScraper;
