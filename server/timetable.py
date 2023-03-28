from __future__ import annotations
import random
import re
from Subject import Subject
import mysql.connector
import json
from pprint import PrettyPrinter as PP
import sys

########################################### DB Connection #######################################################

mydb = mysql.connector.connect(host="localhost", port=3306, user="root", password="admin", database='timetablegenerator')

mycursor = mydb.cursor()

########################################### Constants ###########################################################

args = sys.argv
pop_size = 20
num_generations=10
mutate_rate=0.5
morning = (args[1]=='Morning')
afternoon = (args[1]=='Afternoon')
requiredCredits = int(args[2])
requiredSubjects = args[4].split(',')
requiredFaculty = args[3].split(',')

SlotTimings={'A1':[1, 14], 'B1':[7, 20], 'C1':[13, 26], 'D1':[3, 19], 'E1':[9, 25], 'F1':[2, 15], 'G1':[8, 21], 'TA1':[27], 'TB1':[4], 'TC1':[10], 'TD1':[16], 'TE1':[22], 'TF1':[28], 'TG1':[5], 'TAA1':[11], 'TCC1':[23], 'V1':[16], 'V2':[17], 'A2':[31, 44], 'B2':[37, 50], 'C2':[43, 56], 'D2':[33, 49], 'E2':[39, 55], 'F2':[32, 45], 'G2':[38, 51], 'TA2':[57], 'TB2':[34], 'TC2':[40], 'TD2':[46], 'TE2':[52], 'TF2':[58], 'TG2':[35], 'TAA2':[41], 'TBB2':[47], 'TCC2':[53], 'V3':[61], 'V4':[62], 'V5':[63], 'V6':[64], 'V7':[65]}

    
pp = PP(width=80, depth=6, sort_dicts=True, underscore_numbers=True)

LabTimings = {f'L{i+1}':[i+1] for i in range(60)}

SlotTimings = SlotTimings | LabTimings

morningSlots = list(set([slot for slot in SlotTimings.keys() if re.search("^.*1$|^V{1-2}{1}$", slot)]).union(set([f'L{i}' for i in range(30, 61)])))
afternoonSlots =  list(set([slot for slot in SlotTimings.keys() if re.search("^.*2$|^V{3-7}{1}$", slot)]).union(set([f'L{i}' for i in range(1,31)])))


############################## List of Subjects [Get this from frontend] ###########################################

Subjects = []

mycursor.execute('select * from subjects;')

myresult  = mycursor.fetchall()

Subjects = [Subject(_code=code, _credits=credits, _slot=slots.split(','), _faculty=faculty, _hasLab = hasLab, _hasJ = hasJ, _name=name) for (code, credits, slots, faculty, hasLab, hasJ,name) in myresult]

mycursor.execute('call mergeSlots;')

myresult = mycursor.fetchall()

MergedSubjects = [Subject(_code=code, _credits=credits, _slot=slots.split(','), _faculty=faculty, _hasLab = hasLab, _hasJ = hasJ, ) for (faculty, code, slots, credits, hasLab, hasJ) in myresult]

############# Timetable Class [works as member of population with list of included subjects as genes] ##############

class Timetable:
    def __init__(self) -> None:
        self.slots={(i+1):False for i in range(60)}
        self.subjects=[]
        self.fitness = 0.0

    def calcFitness(self) -> None:
        self.fitness=0
        for s in self.subjects:
            self.fitness+=s.credits
        for subject in [subject for subject in self.subjects if subject.code in requiredSubjects]:
            self.fitness += subject.weight
        for code in requiredSubjects:
            if code not in [subject.code for subject in self.subjects]:
                self.fitness-=3
        if morning:
            for sub in self.subjects:
                for slot in sub.slot:
                    if slot in morningSlots:
                        self.fitness+=1
        if afternoon:
            for sub in self.subjects:
                for slot in sub.slot:
                    if slot in afternoonSlots:
                        self.fitness+=1
        

        if sum([subject.credits for subject in self.subjects])>requiredCredits:
            self.fitness = int(self.fitness/2)


    def randomize(self, subjects: list[Subject]) -> None:
        random.seed()
        for s in subjects:
            no = random.random()
            if(no>0.5):
                self.addSub(s)

    def addSub(self, s: Subject)-> bool:
        for sub in self.subjects:
            if sub.code==s.code:
                return False
        if s.hasLab:
            possibleAdds = [sub for sub in MergedSubjects if sub.code==s.code]
            s = random.choice(possibleAdds)
        if self.subjects.count(s)==1:
            return True
        for slot in s.slot:
            for a in SlotTimings[slot]:
                if self.slots[a]:
                    return False
        self.subjects.append(s)
        for slot in s.slot:
            for a in SlotTimings[slot]:
                self.slots[a]=True

    def removeSub(self, s:Subject) -> None:
        try:
            self.subjects.remove(s)
            for slot in s.slot:
                for a in SlotTimings[slot]:
                  try:
                    self.slots[a]=False
                  except KeyError:
                    continue
        except ValueError:
            pass

    # Actual Crossover Function
    def giveBebe(self, tt: Timetable, mutateRate: float, subjects:list[Subject]) -> Timetable:
        bebe = Timetable()
        random.seed()
        pool = self.subjects + tt.subjects
        for sub in self.subjects+tt.subjects:
            if random.random()<mutateRate:
                pool.remove(sub)
        leftOverSubs  = [sub for sub in subjects if sub not in pool]
        for sub in pool: 
            bebe.addSub(sub)
        for sub in leftOverSubs:
            if random.random()<mutateRate:
                bebe.addSub(sub)
        return bebe
    
    def __str__(self) -> str:
        return "{" + f'"Filled Slots":{str([k for k,v in self.slots.items() if v])}, "Subjects":{str(self.subjects)}, "Fitness":{self.fitness}, "Credits":{sum([sub.credits for sub in self.subjects])}' + "}"

#################### Population Class [Works on all the timetables, handles all the looping] #######################

class Population:
    matingPool=[]
    pop=[]
    newPop=[]
    best=Timetable()
    def __init__(self, subjects: list[Subject], popSize:int=10, mutateRate:float=0.2 ) -> None:
        self.size=popSize
        self.generatePop(popSize, subjects)
        self.subjects=subjects
        self.mutateRate=mutateRate

    def generatePop(self, popSize:int, subjects:list[Subject]) -> None:
        self.pop=[Timetable() for _ in range(popSize)]
        for tt in self.pop:
            tt.randomize(subjects) 
    
    def crossover(self) -> None:
        random.seed()
        for _ in range(self.size):
            mother=self.chooseParent()
            father=self.chooseParent()
            bebe = mother.giveBebe(father, self.mutateRate, self.subjects)
            self.newPop.append(bebe)
        self.pop=self.newPop
        self.newPop=[]
        
    def calcFitnesses(self) -> None: 
        self.totalFitness=0
        for tt in self.pop:
            tt.calcFitness()
            if tt.fitness>self.best.fitness:
                self.best=tt
            self.totalFitness+=tt.fitness

    def chooseParent(self) -> Timetable:
        no=random.randint(0,self.totalFitness)
        sum=0
        for tt in self.pop:
            sum+=tt.fitness
            if sum>=no:
                return tt
        return random.choice(pop)
    
    def PrintPopulation(population: Population) -> None:
        a='{ '
        for tt in population.pop:
            a+=str(tt)
            a+=','
        a+=' }'
        pp.pprint(a)

############################### Main Program [Actual genetic Algorithm] ############################################

# Initialize
pop = Population(Subjects, pop_size, mutate_rate)
pop.calcFitnesses()
# pp.pprint(str(pop.best))

for _ in range(num_generations):
    pop.calcFitnesses()
    pop.crossover()

pop.calcFitnesses()
# Result
print(str(pop.best))