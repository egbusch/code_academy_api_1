const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

const timesheetsRouter = require('./timesheets');
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
    db.get(`SELECT * FROM Employee WHERE Employee.id = $employeeId`,
        {
            $employeeId: employeeId
        },
        (error, employee) => {
            if (error) {
                next(error);
            } else if (employee) {
                req.employee = employee;
                next();
            } else {
                return res.sendStatus(404);
            }
        }
    );
});

employeesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Employee WHERE is_current_employee = 1`,
        (error, employees) => {
            if (error) {
                next(error);
            } else {
                // console.log(employees);
                res.status(200).json({employees});
            }
        }
    );
});

employeesRouter.post('/', (req, res, next) => {
    
    // console.log(req.body.employee);
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const is_current_employee = req.body.employee.is_current_employee ? 0 : 1;

    // console.log(name);
    // console.log(position);
    // console.log(wage);
    // console.log(is_current_employee);

    if (!name || !position || !wage) {
        return res.status(404).send('Provided info is missing');
    } else {
        // CRAEAR NUEVO EMPLEADO
        db.run(`INSERT INTO Employee (name, position, wage, is_current_employee) 
        VALUES ($name, $position, $wage, $is_current_employee)`,
            {
                $name: name,
                $position: position,
                $wage: wage,
                $is_current_employee: is_current_employee
            },
            function(error) {
                if (error) {
                    next(error);
                } else {
                    db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
                        (error, employee) => {
                            // console.log(employee);
                            res.status(201).json({employee});
                        }
                    );
                }
            }
        );
    }
});

employeesRouter.get('/:employeeId', (req, res, next) => {
    console.log(req.employee);
    res.status(200).json(req.employee);
});

employeesRouter.put('/:employeeId', (req, res, next) => {
    
    console.log(req.body);
    const name = req.body.name;
    const position = req.body.position;
    const wage = req.body.wage;
    const is_current_employee = req.body.is_current_employee;

    if (!name || !position || !wage || !is_current_employee) {
        return res.status(400).send('Provided info is missing');
    } else {
        db.run(`UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $is_current_employee 
        WHERE Employee.id = $employeeId`,
        {   
            $name: name,
            $position: position,
            $wage: wage,
            $is_current_employee: is_current_employee,
            $employeeId: req.employee.id
        },
        (error) => {
            if (error) {
                next(error);
            } else {
                db.get(`SELECT * FROM Employee WHERE Employee.id = $employeeId`,
                    {
                        $employeeId: req.employee.id
                    },
                    (error, employee) => {
                        console.log(employee);
                        res.status(200).json(employee);
                    }
                );
            }
        }
    );
    }
});

employeesRouter.delete('/:employeeId', (req, res, next) => {

    if (req.employee.is_current_employee == 1) {
        db.run(`UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId`,
            {
                $employeeId: req.employee.id
            },
            (error) => {
                if (error) {
                    next(error);
                } else {
                    db.get(`SELECT * FROM Employee WHERE Employee.id = $employeeId`,
                        {
                            $employeeId: req.employee.id
                        },
                        (error, employee) => {
                            console.log(employee);
                            res.status(200).json(employee);
                        }
                    );
                }
            }
        );
    } else {
        res.status(200).send('Employee already deleated in the past');
    }
});

module.exports = employeesRouter;