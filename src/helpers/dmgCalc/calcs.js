module.exports = {
    calcAtk: (atk, atkModifier, flatModifier, stageModifier, debuffModifier) => {
        const totalAtk = Math.floor(atk * stageModifier) * (1 + atkModifier) + flatModifier;
        if (debuffModifier)
            return Math.floor(totalAtk * (1 + debuffModifier));
        return totalAtk;
    },
    calcDefOrRes: (def, defBuff, flatModifier, stageModifier, flatStageModifier, finalFlatModifier, defDebuff) =>
        (((def + flatStageModifier) * stageModifier + flatModifier) * (1 + defBuff) + finalFlatModifier) * (1 + defDebuff),
    calcTheoreticalAtkInterval: (atkInterval, aspdMod, atkIntervalMod) =>
        (atkInterval + atkIntervalMod) / (Math.max(Math.min(100 + aspdMod, 600), 20) / 100),
    calcActualAtkInterval: (theoreticalAtkInterval) =>
        Math.round(theoreticalAtkInterval * 30) / 30,
    calcPhysDmgHit: (atk, def, atkScale, defIgnore, flatDefIgnore, dmgModifier) => {
        atkScale = atkScale == 0 ? 1 : atkScale;
        dmgModifier = dmgModifier == 0 ? 1 : dmgModifier;
        return Math.max(0.05 * atk * atkScale, atk * atkScale - (1 - defIgnore) * Math.max(0, def - flatDefIgnore)) * dmgModifier;
    },
    calcArtsDmgHit: (atk, res, atkScale, resIgnore, flatResIgnore, dmgModifier) => {
        atkScale = atkScale == 0 ? 1 : atkScale;
        dmgModifier = dmgModifier == 0 ? 1 : dmgModifier;
        return Math.max(0.05 * atk * atkScale, 0.01 * atk * atkScale * Math.max(0, 100 - (1 - resIgnore) * Math.max(0, res - flatResIgnore))) * dmgModifier;
    },
};