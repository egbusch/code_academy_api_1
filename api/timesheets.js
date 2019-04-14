const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
    
    db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId`,
    {
        $timesheetId: timesheetId
    },
    (error, timesheet) => {
        if (error) {
            next(error);
        } else if (timesheet) {
            req.timesheet = timesheet;
            next();
        } else {
            return res.status(404).send('Timesheet was not found');
        }
    });
});

timesheetsRouter.get('/', (req, res, next) => {
    // console.log(req.employee);
    db.all(`SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employee_id`,
        {
            $employee_id: req.employee.id
        },
        (error, timesheets) => {
            if (error) {
                next(error);
            } else {
                res.status(200).json({timesheets});
            }
        }
    );
});

timesheetsRouter.post('/', (req, res, next) => {
    
    // console.log(req.body);
    const hours = req.body.hours;
    const rate = req.body.rate;
    const date = req.body.date;

    // console.log(hours);
    // console.log(rate);
    // console.log(date);
    // console.log(req.employee);

    if (!hours || !rate || !date) {
        return res.status(400).send('Provided info is missing');
    } else {
        // CRAEAR NUEVO TIMESHEET
        db.run(`INSERT INTO Timesheet (hours, rate, date, employee_id) 
        VALUES ($hours, $rate, $date, $employee_id)`,
            {
                $hours: hours,
                $rate: rate,
                $date: date,
                $employee_id: req.employee.id
            },
            function(error) {
                if (error) {
                    next(error);
                } else {
                    db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
                        (error, timesheet) => {
                            // console.log(timesheet);
                            res.status(201).json({timesheet})
                        }
                    );
                }
            }
        );
    }
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    // console.log(req.timesheet);
    const hours = req.body.hours;
    const rate = req.body.rate;
    const date = req.body.date;
    const employee_id = req.body.employee_id;

    // console.log(hours);
    // console.log(rate);
    // console.log(date);
    // console.log(req.employee);

    if (!hours || !rate || !date) {
        return res.status(400).send('Provided info is missing');
    } else {
        db.run(`UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employee_id 
        WHERE Timesheet.id = $timesheetId`,
            {
                $hours: hours,
                $rate: rate,
                $date: date,
                $employee_id: employee_id,
                $timesheetId: req.timesheet.id
            },
            (error) => {
                if (error) {
                    next(error);
                } else {
                    db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId`,
                        {
                            $timesheetId: req.timesheet.id
                        },
                        (error, timesheet) => {
                            // console.log(timesheet);
                            res.status(200).json(timesheet);
                        }
                    );
                }
            }
        );
    }
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    // console.log(req.timesheet);
    db.run(`DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId`,
        {
            $timesheetId: req.timesheet.id
        },
        (error) => {
            if (error) {
                next(error);
            } else {
                res.sendStatus(204);
            }
        }
    );
});

module.exports = timesheetsRouter;