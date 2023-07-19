// This file has been generated automatically by GrGen (www.grgen.net)
// Do not modify this file! Any changes will be lost!
// Generated from "BP.grg" on 07.07.2023 06:50:40 Mitteleuropäische Zeit
using System;
using System.Collections.Generic;
using GRGEN_LIBGR = de.unika.ipd.grGen.libGr;
using GRGEN_LGSP = de.unika.ipd.grGen.lgsp;
using GRGEN_MODEL = de.unika.ipd.grGen.Model_BP;
using GRGEN_ACTIONS = de.unika.ipd.grGen.Action_BP;

namespace de.unika.ipd.grGen.Action_BP
{
    // ------------------------------------------------------

    // The following filter functions are automatically generated, you don't need to supply any further implementation

    public partial class MatchFilters
    {
        public static GRGEN_LIBGR.IMatchesExact<GRGEN_ACTIONS.Rule_addPattern.IMatch_addPattern> Filter_addPattern_orderDescendingBy_prob(GRGEN_LGSP.LGSPGraphProcessingEnvironment procEnv, GRGEN_LIBGR.IMatchesExact<GRGEN_ACTIONS.Rule_addPattern.IMatch_addPattern> matches)
        {
            List<GRGEN_ACTIONS.Rule_addPattern.IMatch_addPattern> matchesArray = matches.ToListExact();
            matchesArray.Sort(new Comparer_addPattern_orderDescendingBy_prob());
            matches.FromListExact();
            return matches;
        }
    }

    // ------------------------------------------------------
}
