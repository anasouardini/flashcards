"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SrsCardC = void 0;
const tools_1 = __importDefault(require("./tools"));
const date_fns_1 = require("date-fns");
class SrsCardC {
    constructor(props) {
        this.repetitions = 0; // Number of consecutive correct answers (level >= 3)
        this.interval = 1; // Days until the next review
        this.easeFactor = 2.5;
        this.creationDate = new Date();
        this.lastReviewDate = new Date();
        this.nextReviewDate = new Date();
        this.priority = "high";
        this.level = 0;
        this.repetitions = props?.repetitions ?? 0;
        this.interval = props?.interval ?? 1;
        this.easeFactor = props?.easeFactor ?? 2.5;
        this.creationDate = props?.creationDate ?? new Date();
        // this.lastReviewDate = new Date();
        // this.nextReviewDate = new Date();
        if (typeof props?.lastReviewDate == 'string') {
            this.lastReviewDate = new Date(props?.lastReviewDate);
        }
        else if (props?.lastReviewDate instanceof Date) {
            this.lastReviewDate = props?.lastReviewDate;
        }
        if (typeof props?.nextReviewDate == 'string') {
            this.nextReviewDate = (0, date_fns_1.addDays)(new Date(props?.nextReviewDate), 1);
        }
        else if (props?.nextReviewDate instanceof Date) {
            this.nextReviewDate = (0, date_fns_1.addDays)(new Date(), 1);
        }
        this.priority = props?.priority ?? "medium";
        this.level = props?.level ?? 0;
    }
    getCardProps() {
        const props = Object.entries(this).reduce((acc, [key, val]) => {
            if (typeof val != 'function') {
                if (val instanceof Date) {
                    acc[key] = val.toISOString().split('T')[0];
                    return acc;
                }
                acc[key] = val;
            }
            return acc;
        }, {});
        return props;
    }
    review(level, reviewDate = new Date()) {
        this.level = level;
        if (level == 0) {
            return;
        }
        if (level < 3) {
            // If quality/level is poor, reset repetitions and interval
            this.repetitions = 0;
            this.interval = 1;
        }
        else {
            this.repetitions += 1;
            if (this.repetitions === 1) {
                this.interval = 1;
            }
            else if (this.repetitions === 2) {
                this.interval = 4;
            }
            else {
                this.interval *= this.easeFactor;
            }
            // Adjust interval based on priority
            if (this.priority === "high") {
                this.interval *= 0.8; // Higher priority means shorter intervals
            }
            else if (this.priority === "low") {
                this.interval *= 1.2; // Lower priority means longer intervals
            }
            // Update the Ease Factor
            // level=3 substracts 0.139
            // level=4 adds nothing
            // level=5 adds 0.1
            this.easeFactor = this.easeFactor + (0.1 - (5 - level) * (0.08 + (5 - level) * 0.02));
            if (this.easeFactor < 1.3) {
                this.easeFactor = 1.3; // Minimum EF is 1.3
            }
        }
        if (this.interval > 1000) {
            console.log('ef', this.easeFactor);
            console.log('interval', this.interval);
            console.log('repetition', this.repetitions);
            throw new Error('SrsCardC.review: Invalid interval, stop missing around! :)');
        }
        // Update the last review date
        if (!tools_1.default.isDateValid(reviewDate)) {
            throw new Error('SrsCardC.review: Invalid review date');
        }
        this.lastReviewDate = reviewDate;
        const reviewDateClone = new Date(this.lastReviewDate);
        // Calculate the next review date based on the interval
        this.nextReviewDate = (0, date_fns_1.addDays)(reviewDateClone, Math.round(this.interval));
        if (!tools_1.default.isDateValid(this.nextReviewDate)) {
            throw new Error('Invalid next review date');
        }
    }
    getNextReviewDate() {
        return this.nextReviewDate;
    }
}
exports.SrsCardC = SrsCardC;
