import json

class Subject:
    def __init__(self, _name='Random', _code='CSE1001', _slot=[], _type='ETH', _credits=3, _basket='PC', _comp=False, _faculty='Mr T', _hasLab=0, _hasJ = 0):
        self.name=_name
        self.code=_code
        self.slot=_slot
        self.type=_type
        self.credits=_credits
        self.basket=_basket
        self.compulsory=_comp
        self.faculty=_faculty
        self.hasLab = _hasLab
        self.hasJ = _hasJ
        self.weight = 10
    
    def __repr__(self) -> str:
        return "{" + f'"Code":"{self.code}", "Slots":{json.dumps(self.slot)}, "Faculty":"{str(self.faculty)}", "Credits":{self.credits}' + "}"
