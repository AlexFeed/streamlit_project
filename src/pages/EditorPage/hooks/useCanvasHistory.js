import { useCallback, useRef, useState } from 'react';

const MAX_HISTORY_STATES = 100;

const areStatesEqual = (left, right) => (
    left === right || JSON.stringify(left) === JSON.stringify(right)
);

export const useCanvasHistory = (initialState) => {
    const [state, setStateValue] = useState(initialState);
    const [pastStates, setPastStates] = useState([]);
    const [futureStates, setFutureStates] = useState([]);
    const stateRef = useRef(state);
    const pastRef = useRef([]);
    const futureRef = useRef([]);

    const setState = useCallback((nextStateOrUpdater) => {
        const previousState = stateRef.current;
        const nextState = typeof nextStateOrUpdater === 'function'
            ? nextStateOrUpdater(previousState)
            : nextStateOrUpdater;

        if (areStatesEqual(previousState, nextState)) return;

        const nextPastStates = [
            ...pastRef.current,
            previousState,
        ].slice(-MAX_HISTORY_STATES);

        stateRef.current = nextState;
        pastRef.current = nextPastStates;
        futureRef.current = [];
        setStateValue(nextState);
        setPastStates(nextPastStates);
        setFutureStates([]);
    }, []);

    const reset = useCallback((nextStateOrUpdater) => {
        const nextState = typeof nextStateOrUpdater === 'function'
            ? nextStateOrUpdater(stateRef.current)
            : nextStateOrUpdater;
        stateRef.current = nextState;
        pastRef.current = [];
        futureRef.current = [];
        setStateValue(nextState);
        setPastStates([]);
        setFutureStates([]);
    }, []);

    const undo = useCallback(() => {
        if (!pastRef.current.length) return;

        const nextPastStates = pastRef.current.slice(0, -1);
        const previousState = pastRef.current[pastRef.current.length - 1];
        const nextFutureStates = [stateRef.current, ...futureRef.current];

        stateRef.current = previousState;
        pastRef.current = nextPastStates;
        futureRef.current = nextFutureStates;
        setStateValue(previousState);
        setPastStates(nextPastStates);
        setFutureStates(nextFutureStates);
    }, []);

    const redo = useCallback(() => {
        if (!futureRef.current.length) return;

        const [nextState, ...nextFutureStates] = futureRef.current;
        const nextPastStates = [
            ...pastRef.current,
            stateRef.current,
        ].slice(-MAX_HISTORY_STATES);

        stateRef.current = nextState;
        pastRef.current = nextPastStates;
        futureRef.current = nextFutureStates;
        setStateValue(nextState);
        setPastStates(nextPastStates);
        setFutureStates(nextFutureStates);
    }, []);

    return {
        state,
        setState,
        reset,
        undo,
        redo,
        canUndo: pastStates.length > 0,
        canRedo: futureStates.length > 0,
    };
};
