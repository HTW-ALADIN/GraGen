abstract class EPCNode {
	public id: string;
}

class EPCEvent extends EPCNode {}

class EPCFunction extends EPCNode {}

class CollapsedEPCPattern extends EPCNode {}

class EPCLoopPattern extends CollapsedEPCPattern {}
class EPCAndPattern extends CollapsedEPCPattern {}
class EPCOrPattern extends CollapsedEPCPattern {}
class EPCXorPattern extends CollapsedEPCPattern {}
class EPCSeqPattern extends CollapsedEPCPattern {}
