describe('Formatting Utilities', () => {
  describe('formatPokemonId', () => {
    const formatPokemonId = (id: number): string => {
      return `#${id.toString().padStart(3, '0')}`;
    };

    it('should format single digit IDs with leading zeros', () => {
      expect(formatPokemonId(1)).toBe('#001');
      expect(formatPokemonId(9)).toBe('#009');
    });

    it('should format double digit IDs with leading zeros', () => {
      expect(formatPokemonId(10)).toBe('#010');
      expect(formatPokemonId(99)).toBe('#099');
    });

    it('should format triple digit IDs without leading zeros', () => {
      expect(formatPokemonId(100)).toBe('#100');
      expect(formatPokemonId(999)).toBe('#999');
    });

    it('should handle four digit IDs', () => {
      expect(formatPokemonId(1000)).toBe('#1000');
      expect(formatPokemonId(9999)).toBe('#9999');
    });
  });

  describe('formatPokemonName', () => {
    const formatPokemonName = (name: string): string => {
      return name
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-');
    };

    it('should capitalize simple names', () => {
      expect(formatPokemonName('pikachu')).toBe('Pikachu');
      expect(formatPokemonName('charizard')).toBe('Charizard');
      expect(formatPokemonName('bulbasaur')).toBe('Bulbasaur');
    });

    it('should handle hyphenated names', () => {
      expect(formatPokemonName('mr-mime')).toBe('Mr-Mime');
      expect(formatPokemonName('ho-oh')).toBe('Ho-Oh');
      expect(formatPokemonName('porygon-z')).toBe('Porygon-Z');
    });

    it('should handle special forms', () => {
      expect(formatPokemonName('nidoran-f')).toBe('Nidoran-F');
      expect(formatPokemonName('nidoran-m')).toBe('Nidoran-M');
    });

    it('should handle already capitalized names', () => {
      expect(formatPokemonName('PIKACHU')).toBe('PIKACHU');
      expect(formatPokemonName('Charizard')).toBe('Charizard');
    });

    it('should handle empty strings', () => {
      expect(formatPokemonName('')).toBe('');
    });
  });

  describe('formatStatName', () => {
    const formatStatName = (statName: string): string => {
      const statNameMap: Record<string, string> = {
        'hp': 'HP',
        'attack': 'Attack',
        'defense': 'Defense',
        'special-attack': 'Sp. Atk',
        'special-defense': 'Sp. Def',
        'speed': 'Speed'
      };
      return statNameMap[statName] || statName;
    };

    it('should format stat names correctly', () => {
      expect(formatStatName('hp')).toBe('HP');
      expect(formatStatName('attack')).toBe('Attack');
      expect(formatStatName('defense')).toBe('Defense');
      expect(formatStatName('special-attack')).toBe('Sp. Atk');
      expect(formatStatName('special-defense')).toBe('Sp. Def');
      expect(formatStatName('speed')).toBe('Speed');
    });

    it('should handle unknown stat names', () => {
      expect(formatStatName('unknown-stat')).toBe('unknown-stat');
      expect(formatStatName('custom')).toBe('custom');
    });
  });

  describe('formatHeight', () => {
    const formatHeight = (height: number): string => {
      // Height is in decimeters, convert to meters
      return `${(height / 10).toFixed(1)} m`;
    };

    it('should convert decimeters to meters', () => {
      expect(formatHeight(7)).toBe('0.7 m');
      expect(formatHeight(10)).toBe('1.0 m');
      expect(formatHeight(20)).toBe('2.0 m');
      expect(formatHeight(100)).toBe('10.0 m');
    });

    it('should handle decimal values', () => {
      expect(formatHeight(15)).toBe('1.5 m');
      expect(formatHeight(23)).toBe('2.3 m');
      expect(formatHeight(4)).toBe('0.4 m');
    });
  });

  describe('formatWeight', () => {
    const formatWeight = (weight: number): string => {
      // Weight is in hectograms, convert to kilograms
      return `${(weight / 10).toFixed(1)} kg`;
    };

    it('should convert hectograms to kilograms', () => {
      expect(formatWeight(69)).toBe('6.9 kg');
      expect(formatWeight(100)).toBe('10.0 kg');
      expect(formatWeight(1000)).toBe('100.0 kg');
    });

    it('should handle decimal values', () => {
      expect(formatWeight(85)).toBe('8.5 kg');
      expect(formatWeight(123)).toBe('12.3 kg');
      expect(formatWeight(5)).toBe('0.5 kg');
    });
  });

  describe('getTypeColor', () => {
    const getTypeColor = (type: string): string => {
      const colors: Record<string, string> = {
        normal: '#A8A878',
        fire: '#F08030',
        water: '#6890F0',
        electric: '#F8D030',
        grass: '#78C850',
        ice: '#98D8D8',
        fighting: '#C03028',
        poison: '#A040A0',
        ground: '#E0C068',
        flying: '#A890F0',
        psychic: '#F85888',
        bug: '#A8B820',
        rock: '#B8A038',
        ghost: '#705898',
        dragon: '#7038F8',
        dark: '#705848',
        steel: '#B8B8D0',
        fairy: '#EE99AC',
      };
      return colors[type.toLowerCase()] || '#68A090';
    };

    it('should return correct color for each type', () => {
      expect(getTypeColor('fire')).toBe('#F08030');
      expect(getTypeColor('water')).toBe('#6890F0');
      expect(getTypeColor('grass')).toBe('#78C850');
      expect(getTypeColor('electric')).toBe('#F8D030');
      expect(getTypeColor('psychic')).toBe('#F85888');
      expect(getTypeColor('ice')).toBe('#98D8D8');
      expect(getTypeColor('dragon')).toBe('#7038F8');
      expect(getTypeColor('dark')).toBe('#705848');
      expect(getTypeColor('fairy')).toBe('#EE99AC');
    });

    it('should handle uppercase type names', () => {
      expect(getTypeColor('FIRE')).toBe('#F08030');
      expect(getTypeColor('WATER')).toBe('#6890F0');
    });

    it('should return default color for unknown types', () => {
      expect(getTypeColor('unknown')).toBe('#68A090');
      expect(getTypeColor('')).toBe('#68A090');
      expect(getTypeColor('custom-type')).toBe('#68A090');
    });
  });

  describe('getGenerationFromId', () => {
    const getGenerationFromId = (id: number): number => {
      if (id <= 151) return 1;
      if (id <= 251) return 2;
      if (id <= 386) return 3;
      if (id <= 493) return 4;
      if (id <= 649) return 5;
      if (id <= 721) return 6;
      if (id <= 809) return 7;
      if (id <= 905) return 8;
      return 9;
    };

    it('should return correct generation for Pokemon IDs', () => {
      expect(getGenerationFromId(1)).toBe(1);
      expect(getGenerationFromId(151)).toBe(1);
      expect(getGenerationFromId(152)).toBe(2);
      expect(getGenerationFromId(251)).toBe(2);
      expect(getGenerationFromId(252)).toBe(3);
      expect(getGenerationFromId(386)).toBe(3);
      expect(getGenerationFromId(387)).toBe(4);
      expect(getGenerationFromId(493)).toBe(4);
      expect(getGenerationFromId(494)).toBe(5);
      expect(getGenerationFromId(649)).toBe(5);
      expect(getGenerationFromId(650)).toBe(6);
      expect(getGenerationFromId(721)).toBe(6);
      expect(getGenerationFromId(722)).toBe(7);
      expect(getGenerationFromId(809)).toBe(7);
      expect(getGenerationFromId(810)).toBe(8);
      expect(getGenerationFromId(905)).toBe(8);
      expect(getGenerationFromId(906)).toBe(9);
    });
  });

  describe('formatEffectiveness', () => {
    const formatEffectiveness = (multiplier: number): { text: string; color: string } => {
      if (multiplier === 0) return { text: 'No Effect', color: '#565656' };
      if (multiplier === 0.25) return { text: '¼×', color: '#BC2029' };
      if (multiplier === 0.5) return { text: '½×', color: '#F85858' };
      if (multiplier === 1) return { text: '1×', color: '#A8A878' };
      if (multiplier === 2) return { text: '2×', color: '#78C850' };
      if (multiplier === 4) return { text: '4×', color: '#00C851' };
      return { text: `${multiplier}×`, color: '#A8A878' };
    };

    it('should format type effectiveness correctly', () => {
      expect(formatEffectiveness(0)).toEqual({ text: 'No Effect', color: '#565656' });
      expect(formatEffectiveness(0.25)).toEqual({ text: '¼×', color: '#BC2029' });
      expect(formatEffectiveness(0.5)).toEqual({ text: '½×', color: '#F85858' });
      expect(formatEffectiveness(1)).toEqual({ text: '1×', color: '#A8A878' });
      expect(formatEffectiveness(2)).toEqual({ text: '2×', color: '#78C850' });
      expect(formatEffectiveness(4)).toEqual({ text: '4×', color: '#00C851' });
    });

    it('should handle unusual multipliers', () => {
      expect(formatEffectiveness(1.5)).toEqual({ text: '1.5×', color: '#A8A878' });
      expect(formatEffectiveness(3)).toEqual({ text: '3×', color: '#A8A878' });
    });
  });
});