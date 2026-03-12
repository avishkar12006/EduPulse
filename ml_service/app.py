from flask import Flask, request, jsonify
from sklearn.cluster import KMeans
import numpy as np

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ML Service online and ready for clustering"})

@app.route('/predict_cluster', methods=['POST'])
def predict_cluster():
    """
    Receives an array of student features:
    [ [healthScore, attendancePct, engagementScore], ... ]
    Returns an array of assigned clusters: ['top', 'medium', 'below']
    """
    try:
        data = request.json
        features = data.get('features', [])
        
        if not features:
            return jsonify({"error": "No features provided"}), 400

        # Convert to numpy array
        X = np.array(features)
        
        # If fewer than 3 students, we can't reliably cluster into 3 groups.
        # Handle simple rule-based fallback
        if len(X) < 3:
            clusters = []
            for student in X:
                score, att, eng = student[0], student[1], student[2]
                if score >= 75 and att >= 85:
                    clusters.append('top')
                elif score <= 50 or att <= 75:
                    clusters.append('below')
                else:
                    clusters.append('medium')
            return jsonify({"clusters": clusters})
            
        # Fit K-Means with exactly 3 clusters
        # Ensure consistent seed for repeatability if needed
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X)
        
        # We need to map the arbitrary 0,1,2 labels to our semantic 'top', 'medium', 'below'
        # We'll do this by looking at the cluster centers. Higher values = better.
        centers = kmeans.cluster_centers_
        
        # Calculate a combined "goodness" score for each center (e.g., sum of features)
        center_scores = centers.sum(axis=1)
        
        # Sort indices by goodness score (descending)
        sorted_indices = np.argsort(-center_scores)
        top_idx, med_idx, bel_idx = sorted_indices[0], sorted_indices[1], sorted_indices[2]
        
        # Create mapping from numeric label to string
        label_map = {
            top_idx: 'top',
            med_idx: 'medium',
            bel_idx: 'below'
        }
        
        # Map labels
        assigned_clusters = [label_map[l] for l in labels]
        
        return jsonify({
            "clusters": assigned_clusters,
            "centers": {
                "top": centers[top_idx].tolist(),
                "medium": centers[med_idx].tolist(),
                "below": centers[bel_idx].tolist()
            }
        })

    except Exception as e:
        print(f"Clustering error: {str(e)}")
        # Graceful fallback: treat heavily on simple score threshold
        return jsonify({"error": str(e), "message": "Fell back to rule-based evaluation"}), 500

if __name__ == '__main__':
    # Run service on port 5001 internally
    app.run(host='0.0.0.0', port=5001, debug=True)
