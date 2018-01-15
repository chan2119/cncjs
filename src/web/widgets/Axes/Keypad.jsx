import classNames from 'classnames';
import ensureArray from 'ensure-array';
import frac from 'frac';
import includes from 'lodash/includes';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Repeatable from 'react-repeatable';
import { Button } from '../../components/Buttons';
import Dropdown, { MenuItem } from '../../components/Dropdown';
import Space from '../../components/Space';
import controller from '../../lib/controller';
import i18n from '../../lib/i18n';
import {
    // Units
    IMPERIAL_UNITS,
    IMPERIAL_STEPS,
    METRIC_UNITS,
    METRIC_STEPS
} from '../../constants';
import styles from './index.styl';

const Fraction = (props) => {
    const { numerator, denominator } = props;

    return (
        <span
            style={{
                whiteSpace: 'nowrap',
                display: 'inline-block',
                verticalAlign: '-0.5em',
                fontSize: '85%',
                textAlign: 'center'
            }}
        >
            <span
                style={{
                    display: 'block',
                    lineHeight: '1em',
                    margin: '0 0.1em'
                }}
            >
                {numerator}
            </span>
            <span
                style={{
                    position: 'absolute',
                    left: -10000,
                    top: 'auto',
                    width: 1,
                    height: 1,
                    overflow: 'hidden'
                }}
            >
                /
            </span>
            <span
                style={{
                    borderTop: '1px solid',
                    display: 'block',
                    lineHeight: '1em',
                    margin: '0 0.1em',
                    minWidth: 16
                }}
            >
                {denominator}
            </span>
        </span>
    );
};

class Keypad extends PureComponent {
    static propTypes = {
        config: PropTypes.object,
        state: PropTypes.object,
        actions: PropTypes.object
    };

    handleSelect = (eventKey) => {
        const commands = ensureArray(eventKey);
        commands.forEach(command => controller.command('gcode', command));
    };

    state = {
        value: 0
    };

    renderRationalNumberWithBoundedDenominator(value) {
        // https://github.com/SheetJS/frac
        const denominatorDigits = 4;
        const maximumDenominator = Math.pow(10, Number(denominatorDigits) || 0) - 1; // 10^4 - 1 = 9999
        const [quot, numerator, denominator] = frac(value, maximumDenominator, true);

        if (numerator > 0) {
            return (
                <span>
                    {quot > 0 ? quot : ''}
                    <Space width="2" />
                    <Fraction
                        numerator={numerator}
                        denominator={denominator}
                    />
                </span>
            );
        }

        return (
            <span>{quot > 0 ? quot : ''}</span>
        );
    }
    renderImperialMenuItems() {
        const { state } = this.props;
        const step = state.jog.step.imperial;

        return IMPERIAL_STEPS.map((value, key) => {
            const active = (key === step);

            return (
                <MenuItem
                    key={value}
                    eventKey={key}
                    active={active}
                >
                    {this.renderRationalNumberWithBoundedDenominator(value)}
                    <Space width="4" />
                    <sub>{i18n._('in')}</sub>
                </MenuItem>
            );
        });
    }
    renderMetricMenuItems() {
        const { state } = this.props;
        const step = state.jog.step.metric;

        return METRIC_STEPS.map((value, key) => {
            const active = (key === step);

            return (
                <MenuItem
                    key={value}
                    eventKey={key}
                    active={active}
                >
                    {value}
                    <Space width="4" />
                    <sub>{i18n._('mm')}</sub>
                </MenuItem>
            );
        });
    }
    render() {
        const { state, actions } = this.props;
        const { canClick, units, axes, jog } = state;
        const canChangeUnits = canClick;
        const canChangeStep = canClick;
        const canStepForward = canChangeStep && (
            (units === IMPERIAL_UNITS && (jog.step.imperial < IMPERIAL_STEPS.length - 1)) ||
            (units === METRIC_UNITS && (jog.step.metric < METRIC_STEPS.length - 1))
        );
        const canStepBackward = canChangeStep && (
            (units === IMPERIAL_UNITS && (jog.step.imperial > 0)) ||
            (units === METRIC_UNITS && (jog.step.metric > 0))
        );
        const canClickX = canClick && includes(axes, 'x');
        const canClickY = canClick && includes(axes, 'y');
        const canClickXY = canClickX && canClickY;
        const canClickZ = canClick && includes(axes, 'z');
        const highlightX = canClickX && (jog.keypad || jog.axis === 'x');
        const highlightY = canClickY && (jog.keypad || jog.axis === 'y');
        const highlightZ = canClickZ && (jog.keypad || jog.axis === 'z');

        return (
            <div className={styles.keypad}>
                <div className="row no-gutters">
                    <div className="col-xs-8">
                        <div className={styles.rowSpace}>
                            <div className="row no-gutters">
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={styles.btnKeypad}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ X: -distance, Y: distance });
                                            }}
                                            disabled={!canClickXY}
                                            title={i18n._('Move X- Y+')}
                                        >
                                            <i className={classNames('fa', 'fa-arrow-circle-up', styles['rotate--45deg'])} style={{ fontSize: 16 }} />
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={classNames(
                                                styles.btnKeypad,
                                                { [styles.highlight]: highlightY }
                                            )}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ Y: distance });
                                            }}
                                            disabled={!canClickY}
                                            title={i18n._('Move Y+')}
                                        >
                                            <span className={styles.keypadText}>Y</span>
                                            <span className={styles.keypadSubscript}>
                                                <i className="fa fa-fw fa-plus" />
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={styles.btnKeypad}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ X: distance, Y: distance });
                                            }}
                                            disabled={!canClickXY}
                                            title={i18n._('Move X+ Y+')}
                                        >
                                            <i className={classNames('fa', 'fa-arrow-circle-up', styles['rotate-45deg'])} style={{ fontSize: 16 }} />
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={classNames(
                                                styles.btnKeypad,
                                                { [styles.highlight]: highlightZ }
                                            )}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ Z: distance });
                                            }}
                                            disabled={!canClickZ}
                                            title={i18n._('Move Z+')}
                                        >
                                            <span className={styles.keypadText}>Z</span>
                                            <span className={styles.keypadSubscript}>
                                                <i className="fa fa-fw fa-plus" />
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.rowSpace}>
                            <div className="row no-gutters">
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={classNames(
                                                styles.btnKeypad,
                                                { [styles.highlight]: highlightX }
                                            )}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ X: -distance });
                                            }}
                                            disabled={!canClickX}
                                            title={i18n._('Move X-')}
                                        >
                                            <span className={styles.keypadText}>X</span>
                                            <span className={styles.keypadSubscript}>
                                                <i className="fa fa-fw fa-minus" />
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={styles.btnKeypad}
                                            onClick={() => actions.move({ X: 0, Y: 0 })}
                                            disabled={!canClickXY}
                                            title={i18n._('Move To XY Zero (G0 X0 Y0)')}
                                        >
                                            <span className={styles.keypadText}>X/Y</span>
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={classNames(
                                                styles.btnKeypad,
                                                { [styles.highlight]: highlightX }
                                            )}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ X: distance });
                                            }}
                                            disabled={!canClickX}
                                            title={i18n._('Move X+')}
                                        >
                                            <span className={styles.keypadText}>X</span>
                                            <span className={styles.keypadSubscript}>+</span>
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={styles.btnKeypad}
                                            onClick={() => actions.move({ Z: 0 })}
                                            disabled={!canClickZ}
                                            title={i18n._('Move To Z Zero (G0 Z0)')}
                                        >
                                            <span className={styles.keypadText}>Z</span>
                                            <span className={styles.keypadSubscript}>
                                                <i className="fa fa-fw fa-circle-o" style={{ transform: 'scaleX(.7)' }} />
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.rowSpace}>
                            <div className="row no-gutters">
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={styles.btnKeypad}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ X: -distance, Y: -distance });
                                            }}
                                            disabled={!canClickXY}
                                            title={i18n._('Move X- Y-')}
                                        >
                                            <i className={classNames('fa', 'fa-arrow-circle-down', styles['rotate-45deg'])} style={{ fontSize: 16 }} />
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={classNames(
                                                styles.btnKeypad,
                                                { [styles.highlight]: highlightY }
                                            )}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ Y: -distance });
                                            }}
                                            disabled={!canClickY}
                                            title={i18n._('Move Y-')}
                                        >
                                            <span className={styles.keypadText}>Y</span>
                                            <span className={styles.keypadSubscript}>
                                                <i className="fa fa-fw fa-minus" />
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={styles.btnKeypad}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ X: distance, Y: -distance });
                                            }}
                                            disabled={!canClickXY}
                                            title={i18n._('Move X+ Y-')}
                                        >
                                            <i className={classNames('fa', 'fa-arrow-circle-down', styles['rotate--45deg'])} style={{ fontSize: 16 }} />
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={classNames(
                                                styles.btnKeypad,
                                                { [styles.highlight]: highlightZ }
                                            )}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ Z: -distance });
                                            }}
                                            disabled={!canClickZ}
                                            title={i18n._('Move Z-')}
                                        >
                                            <span className={styles.keypadText}>Z</span>
                                            <span className={styles.keypadSubscript}>
                                                <i className="fa fa-fw fa-minus" />
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-4">
                        <div style={{ marginLeft: 10, marginBottom: 5 }}>
                            <Dropdown
                                pullRight
                                style={{
                                    width: '100%'
                                }}
                                disabled={!canChangeUnits}
                            >
                                <Dropdown.Toggle
                                    btnStyle="flat"
                                    style={{
                                        textAlign: 'right',
                                        width: '100%'
                                    }}
                                    title={i18n._('Units')}
                                >
                                    {units === IMPERIAL_UNITS && i18n._('G20 (inch)')}
                                    {units === METRIC_UNITS && i18n._('G21 (mm)')}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <MenuItem header>
                                        {i18n._('Units')}
                                    </MenuItem>
                                    <MenuItem
                                        active={units === IMPERIAL_UNITS}
                                        onSelect={() => {
                                            controller.command('gcode', 'G20');
                                        }}
                                    >
                                        {i18n._('G20 (inch)')}
                                    </MenuItem>
                                    <MenuItem
                                        active={units === METRIC_UNITS}
                                        onSelect={() => {
                                            controller.command('gcode', 'G21');
                                        }}
                                    >
                                        {i18n._('G21 (mm)')}
                                    </MenuItem>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        <div style={{ marginLeft: 10, marginBottom: 5 }}>
                            {units === IMPERIAL_UNITS &&
                            <Dropdown
                                pullRight
                                style={{
                                    width: '100%'
                                }}
                                disabled={!canChangeStep}
                                onSelect={(eventKey) => {
                                    const step = eventKey;
                                    actions.selectStep(step);
                                }}
                            >
                                <Dropdown.Toggle
                                    btnStyle="flat"
                                    style={{
                                        textAlign: 'right',
                                        width: '100%'
                                    }}
                                >
                                    {this.renderRationalNumberWithBoundedDenominator(IMPERIAL_STEPS[jog.step.imperial])}
                                    <Space width="4" />
                                    <sub>{i18n._('in')}</sub>
                                </Dropdown.Toggle>
                                <Dropdown.Menu
                                    style={{
                                        maxHeight: 150,
                                        overflowY: 'auto'
                                    }}
                                >
                                    <MenuItem header>
                                        {i18n._('Imperial')}
                                    </MenuItem>
                                    {this.renderImperialMenuItems()}
                                </Dropdown.Menu>
                            </Dropdown>
                            }
                            {units === METRIC_UNITS &&
                            <Dropdown
                                pullRight
                                style={{
                                    width: '100%'
                                }}
                                disabled={!canChangeStep}
                                onSelect={(eventKey) => {
                                    const step = eventKey;
                                    actions.selectStep(step);
                                }}
                            >
                                <Dropdown.Toggle
                                    btnStyle="flat"
                                    style={{
                                        textAlign: 'right',
                                        width: '100%'
                                    }}
                                >
                                    {METRIC_STEPS[jog.step.metric]}
                                    <Space width="4" />
                                    <sub>{i18n._('mm')}</sub>
                                </Dropdown.Toggle>
                                <Dropdown.Menu
                                    style={{
                                        maxHeight: 150,
                                        overflowY: 'auto'
                                    }}
                                >
                                    <MenuItem header>
                                        {i18n._('Metric')}
                                    </MenuItem>
                                    {this.renderMetricMenuItems()}
                                </Dropdown.Menu>
                            </Dropdown>
                            }
                        </div>
                        <div style={{ marginLeft: 10, marginBottom: 5 }}>
                            <div className="row no-gutters">
                                <div className="col-xs-6">
                                    <Repeatable
                                        disabled={!canStepBackward}
                                        style={{ marginRight: 2.5 }}
                                        repeatDelay={500}
                                        repeatInterval={Math.floor(1000 / 15)}
                                        onHold={actions.stepBackward}
                                        onRelease={actions.stepBackward}
                                    >
                                        <Button
                                            disabled={!canStepBackward}
                                            style={{ width: '100%' }}
                                            compact
                                            btnStyle="flat"
                                            className="pull-left"
                                        >
                                            <i className="fa fa-minus" />
                                        </Button>
                                    </Repeatable>
                                </div>
                                <div className="col-xs-6">
                                    <Repeatable
                                        disabled={!canStepForward}
                                        style={{ marginLeft: 2.5 }}
                                        repeatDelay={500}
                                        repeatInterval={Math.floor(1000 / 15)}
                                        onHold={actions.stepForward}
                                        onRelease={actions.stepForward}
                                    >
                                        <Button
                                            disabled={!canStepForward}
                                            style={{ width: '100%' }}
                                            compact
                                            btnStyle="flat"
                                            className="pull-right"
                                        >
                                            <i className="fa fa-plus" />
                                        </Button>
                                    </Repeatable>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Keypad;
