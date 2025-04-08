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
var supabase_js_1 = require("@supabase/supabase-js");
var festileaks_js_1 = require("./scrapers/festileaks.js");
var festivalinfo_js_1 = require("./scrapers/festivalinfo.js");
var eblive_js_1 = require("./scrapers/eblive.js");
var followthebeat_js_1 = require("./scrapers/followthebeat.js");
var partyflock_js_1 = require("./scrapers/partyflock.js");
var dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env.local
dotenv_1.default.config({ path: '.env.local' });
var supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var scrapers, festivalArrays, festivals, _i, festivals_1, festival, error, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    scrapers = [
                        new festileaks_js_1.FestileaksScraper(),
                        new festivalinfo_js_1.FestivalInfoScraper(),
                        new eblive_js_1.EBLiveScraper(),
                        new followthebeat_js_1.FollowTheBeatScraper(),
                        new partyflock_js_1.PartyflockScraper(),
                    ];
                    return [4 /*yield*/, Promise.all(scrapers.map(function (scraper) { return __awaiter(_this, void 0, void 0, function () {
                            var error_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console.log("Running scraper: ".concat(scraper.constructor.name));
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, scraper.scrape()];
                                    case 2: return [2 /*return*/, _a.sent()];
                                    case 3:
                                        error_2 = _a.sent();
                                        console.error("Error running scraper ".concat(scraper.constructor.name, ":"), error_2);
                                        return [2 /*return*/, []];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    festivalArrays = _a.sent();
                    festivals = festivalArrays.flat();
                    console.log("Found ".concat(festivals.length, " festivals"));
                    _i = 0, festivals_1 = festivals;
                    _a.label = 2;
                case 2:
                    if (!(_i < festivals_1.length)) return [3 /*break*/, 5];
                    festival = festivals_1[_i];
                    return [4 /*yield*/, supabase
                            .from('festivals')
                            .upsert(__assign(__assign({}, festival), { date: festival.date.toISOString(), last_updated: festival.last_updated.toISOString() }), {
                            onConflict: 'id',
                        })];
                case 3:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error("Error upserting festival ".concat(festival.name, ":"), error);
                    }
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log('Finished updating festivals');
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('Error running scrapers:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
main();
