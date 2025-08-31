import { renderHook } from '@testing-library/react';
import { useAuth } from '../useAuth';

// Test simple pour vérifier que le hook se monte sans erreur
describe('useAuth Hook - Test Simple', () => {
  it('devrait se monter sans erreur', () => {
    // Ce test vérifie simplement que le hook peut être rendu
    // sans planter l'application
    expect(() => {
      renderHook(() => useAuth());
    }).not.toThrow();
  });
});
