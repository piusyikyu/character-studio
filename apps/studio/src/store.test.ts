import { beforeEach, describe, expect, it } from 'vitest';
import { useStudioStore } from './store';

beforeEach(() => useStudioStore.getState().reset());

describe('studio state', () => {
  it('changes direction and renderer independently and resets the studio', () => {
    useStudioStore.getState().setDirection('north');
    useStudioStore.getState().setRenderer('canvas');
    expect(useStudioStore.getState().character.direction).toBe('north');
    expect(useStudioStore.getState().rendererId).toBe('canvas');
    expect(useStudioStore.getState().character.layers).toEqual([]);
    useStudioStore.getState().reset();
    expect(useStudioStore.getState().character.direction).toBe('south');
    expect(useStudioStore.getState().rendererId).toBe('pixi');
  });
});
