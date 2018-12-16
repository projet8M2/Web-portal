'''
Created on 23 nov. 2014

@author: yhadjadj
'''

import networkx as nx
import Calculations as calc

import os
import glob
import sys


def EnrichWithDelay(mgraph):
    
    nodes = mgraph.nodes(True)
    
    for nodes_index in nx.connected_components(mgraph):
        it_edge = mgraph.edges(nodes_index).__iter__()
        try:
            while it_edge:
                edge = it_edge.next()
                node_src = nodes[edge[0]]
                lat1 = node_src[1].get('Latitude')
                long1 = node_src[1].get('Longitude')
                node_dst = nodes[edge[1]]
                lat2 = node_dst[1].get('Latitude')
                long2 = node_dst[1].get('Longitude')
                delay = calc.getLinkDelay(lat1, long1, lat2, long2)
                mgraph[edge[0]][edge[1]]['delay'] = delay
                mgraph[edge[0]][edge[1]]['SRC'] = edge[0]
                mgraph[edge[0]][edge[1]]['DST'] = edge[1]
                
        except :
            pass   
        
    return mgraph