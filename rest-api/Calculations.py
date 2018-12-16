'''
Created on 11 nov. 2014

@author: yhadjadj
'''

import math
import networkx as nx


def distance_on_unit_sphere(lat1, long1, lat2, long2):
    ''' Convert latitude and longitude to 
    spherical coordinates in radians.
    Original source taken from: http://www.johndcook.com/python_longitude_latitude.html
    ''' 
    degrees_to_radians = math.pi/180.0
     
    # phi = 90 - latitude
    phi1 = (90.0 - lat1)*degrees_to_radians
    phi2 = (90.0 - lat2)*degrees_to_radians
    
    # theta = longitude
    theta1 = long1*degrees_to_radians
    theta2 = long2*degrees_to_radians

    # Compute spherical distance from spherical coordinates.
    # For two locations in spherical coordinates 
    cos = (math.sin(phi1)*math.sin(phi2)*math.cos(theta1 - theta2) + 
             math.cos(phi1)*math.cos(phi2))
    arc = math.acos( cos )

    return arc

def distance_on_earth(lat1, long1, lat2, long2):
    # Calculate the distance using a unit circle
    unit_distance=distance_on_unit_sphere(lat1, long1, lat2, long2)
    # exploit earth radius: 6372.795477598 km
    dist=unit_distance*6372.795477598
    
    return dist

def getLinkDelay(lat1, long1, lat2, long2):
    ''' In the following will assume light propagation 299792.458 km/s
    For an optical fiber the propagation delay is generally around 180,000 to 200,000 km/s
    (http://en.wikipedia.org/wiki/Optical_fiber_cable#Propagation_speed_and_delay)'''
    delay=distance_on_earth(lat1, long1, lat2, long2)/180000
    return delay

def getDataRecovery(G,Centroid):
    nodes=G.nodes()
    sp = []
    PathFailureLatency=0.015
    ProcessingDelay=0.010
    
    FixedLatency = PathFailureLatency + ProcessingDelay
    
    MIN = float("inf")
    MAX = 0.0
    AVE = 0.0
    COUNT = 0
    AVOID = True
    
    for node in G.nodes():
        AVOID = True
        min = float("inf")
        for Center in Centroid:
            if node == Center:
                AVOID = False
                pass
            qmin = nx.dijkstra_path_length(G, node, Center, 'delay')
            #log(str(node) + " " + str(Center) + " " + str(qmin))
            if qmin < min:
                min = qmin
        
        if AVOID:
            COUNT=COUNT+1    
            if min < MIN:
                MIN = min
            if min > MAX:
                MAX = min        
            AVE += min
            
    AVE = AVE/COUNT
    
    return MIN*2+FixedLatency, AVE*2+FixedLatency, MAX*2+FixedLatency

def getDegree(G):
    DEG = nx.degree(G)
    AVE=0.0
    for i in range(0,len(DEG)):
        AVE+=DEG[i]
    AVE=AVE/len(DEG)
    return AVE    
    